
const helpers = require('./helpers');

const resourceGroupPattern = '\/resource[Gg]roups\/(.*?)\/';
const resourceIdPattern = '\/virtual[Mm]achines\/(.*?)$';

const ipNamePrefix = 'ipconfig-';

module.exports = function (context, eventGridEvent) {
    if (eventGridEvent.data.resourceProvider === 'Microsoft.Compute') {
        //context.log(eventGridEvent);
        if (eventGridEvent.eventType === 'Microsoft.Resources.ResourceWriteSuccess' && eventGridEvent.data.authorization.action === 'Microsoft.Compute/virtualMachines/write') {

            const resourceGroup = eventGridEvent.data.resourceUri.match(resourceGroupPattern)[1];
            const resourceId = eventGridEvent.data.resourceUri.match(resourceIdPattern)[1];

            helpers.addPublicIP(resourceGroup, ipNamePrefix + resourceId, resourceId).then(() => {
                context.log("Create Public IP OK");
                context.done();
            }).catch((err) => {
                helpers.setErrorAndCloseContext(context, err, 500);
            });

        } else if (eventGridEvent.eventType === 'Microsoft.Resources.ResourceDeleteSuccess' && eventGridEvent.data.authorization.action === 'Microsoft.Compute/virtualMachines/delete') {
            const resourceGroup = eventGridEvent.data.resourceUri.match(resourceGroupPattern)[1];
            const resourceId = eventGridEvent.data.resourceUri.match(resourceIdPattern)[1];

            helpers.deletePublicIP(resourceGroup, ipNamePrefix + resourceId).then(() => {
                context.log("Delete Public IP OK");
                context.done();
            }).catch((err) => {
                helpers.setErrorAndCloseContext(context, err, 500);
            });
        }
    }
    else {
        context.log(`Received event from RP ${eventGridEvent.data.resourceProvider} was unhandled`);
        context.done();
    }
}

