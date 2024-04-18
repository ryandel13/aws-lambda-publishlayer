# GitHub Action - AWS Lambda Layer Publish with compatible runtime
Deploy a layer to aws lambda

# Usage

## Secrets

Add Secret before this action. `Settings > Secrets > Add a new secret`

- `AWS_REGION`
- `AWS_ACCESS_KEY_ID`
- `AWS_SECRET_ACCESS_KEY`

## Example
```yml
- name: AWS Lambda Layer Publish
  uses: ryandel13/aws-lambda-publishlayer@v1.2.0
  env:
    AWS_REGION: ${{ secrets.AWS_REGION }}
    AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
    AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
  with:
    layer_name: TargetLayerName
    zip_file: path/to/file.zip
    lambda_name: TargetFunctionName (comma separated list)
    replace: false
    description: 'verbose description of the layer, not required'
    # An array of compatible runtimes, pass as a string, remember to json-stringify the array before including it here, not required
    compatible_runtimes: '["any", "aws", "compatible", "runtime"]' 
```
## Compatible Runtime Values
* Up-to-date list of available runtimes can be found at the [AWS Lambda runtime developer guide](https://docs.aws.amazon.com/lambda/latest/dg/lambda-runtimes.html)
* Make sure to use the JSON array format rather than the YAML sequence format

## Important
This action was forked from [killdozerx2/aws-lambda-publishlayer](https://github.com/killdozerx2/aws-lambda-publishlayer). Added the feature to apply the new layer to one or more functions within the same action as this was more handy for my current project.
Also updated nearly all dependencies for the buildprocess
