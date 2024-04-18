import * as core from '@actions/core'
import { Lambda, LambdaClientConfig } from '@aws-sdk/client-lambda';
import fs from 'fs'

async function run(): Promise<void> {
  try {
    const LayerName = core.getInput('layer_name', { required: true })
    const LambdaNames = core.getInput('lambda_name', { required: true })
    const zipFile = core.getInput('zip_file', { required: true })
    const replace = core.getInput('replace', { required: true })

    let Description = ''
    // Check if description was provided or not
    if (core.getInput('description', { required: false }) !== '') {
      Description = core.getInput('description', { required: false })
    }
    let CompatibleRuntimes = []
    if (core.getInput('compatible_runtimes', { required: false }) !== '') {
      CompatibleRuntimes = JSON.parse(
        core.getInput('compatible_runtimes', { required: false })
      )
    }

    const accessKeyId = process?.env?.AWS_ACCESS_KEY_ID ? process.env.AWS_ACCESS_KEY_ID : '';
    const secretAccessKey = process?.env?.AWS_SECRET_ACCESS_KEY ? process.env.AWS_SECRET_ACCESS_KEY : '';

    const lambdaConfig: LambdaClientConfig = {
      credentials: {
        accessKeyId,
        secretAccessKey,
      },
      apiVersion: '2015-03-31',
      region: process.env.AWS_REGION,
      maxAttempts: 2,
    }

    const lambda = new Lambda(lambdaConfig)

    core.info('Publishing...')

    const response = await lambda
      .publishLayerVersion({
        Content: {
          ZipFile: fs.readFileSync(zipFile)
        },
        LayerName,
        CompatibleRuntimes,
        Description
      })

    core.setOutput('LayerVersionArn', response.LayerVersionArn)
    core.info(`Publish Success : ${response.LayerVersionArn}`)

    core.info('Attaching Layer to Function')
    const LayerVersionArnList: Array<string> = []

    const LambdaNamesAr = LambdaNames.split(',')
    for (const LambdaName of LambdaNamesAr) {
      if (!replace) {
        const functionConfig = await lambda
          .getFunctionConfiguration({ FunctionName: LambdaName })
        if (functionConfig.Layers) {
          for (const l of functionConfig.Layers) {
            if (l.Arn) LayerVersionArnList.push(l.Arn)
          }
        }
      }
      if (response.LayerVersionArn)
        LayerVersionArnList.push(response.LayerVersionArn)
      await lambda
        .updateFunctionConfiguration({
          FunctionName: LambdaName,
          Layers: LayerVersionArnList
        })
    }
  } catch (error) {
    if (typeof error === 'string') {
      error.toUpperCase() // works, `e` narrowed to string
      core.error(error)
    } else if (error instanceof Error) {
      error.message // works, `e` narrowed to Error
      core.error(error)
    }
  }
}

run()
