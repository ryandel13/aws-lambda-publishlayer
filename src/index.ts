import * as core from '@actions/core'
import Lambda from 'aws-sdk/clients/lambda'
import fs from 'fs'

async function run() {
    core.info('TEST');
    try {
        const LayerName = core.getInput('layer_name', { required: true })
        const zipFile = core.getInput('zip_file', { required: true })
        let Description = '';
        // Check if description was provided or not
        if (core.getInput('description', { required: false }) !== '') {
            Description = core.getInput('description', { required: false })
        }
        let CompatibleRuntimes = []
        if (core.getInput('compatible_runtimes', { required: false }) !== '') {
            CompatibleRuntimes = JSON.parse(core.getInput('compatible_runtimes', { required: false }));
        }

        const lambdaConfig: Lambda.Types.ClientConfiguration = {
            accessKeyId: process.env.AWS_ACCESS_KEY_ID,
            apiVersion: '2015-03-31',
            maxRetries: 2,
            region: process.env.AWS_REGION,
            secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
            sslEnabled: true,
        }

        const lambda = new Lambda(lambdaConfig)

        core.info('Publishing...')

        const response = await lambda
            .publishLayerVersion({
                Content: {
                    ZipFile: fs.readFileSync(zipFile),
                },
                LayerName,
                CompatibleRuntimes,
                Description
            })
            .promise()

        core.setOutput('LayerVersionArn', response.LayerVersionArn);
        core.info(`Publish Success : ${response.LayerVersionArn}`)

        core.info('Attaching Layer to function');

        const layer: Lambda.Types.Layer = {
            Arn: response.LayerVersionArn,
        }


        const functionConfig = await lambda.getFunctionConfiguration().promise();
        if (functionConfig.Layers) {
            functionConfig.Layers.push(layer)
            const response2 = await lambda.updateFunctionConfiguration()
        }

    } catch (error) {

        if (typeof error === "string") {
            error.toUpperCase() // works, `e` narrowed to string
            core.error(error);
        } else if (error instanceof Error) {
            error.message // works, `e` narrowed to Error
            core.error(error);
        }
    }
}

run()
