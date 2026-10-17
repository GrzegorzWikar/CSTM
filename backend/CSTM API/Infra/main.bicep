//  Zasob                     Plan / SKU                          Koszt
//  ------------------------  ----------------------------------  ------------------------------------------
//  App Service (API)         F1 Free (Linux)                     0; limit CPU na dobe, brak Always On
//  Azure SQL Database        Serverless + darmowa oferta         0; po wyczerpaniu limitu baza sie PAUZUJE
//  Static Web Apps (front)   Free                                0
//  Service Bus               Basic + kolejka ticket-events       grosze (platne za operacje, brak oplaty stalej)
//  Key Vault                 Standard                            grosze (platne za operacje, brak oplaty stalej)
//  Log Analytics + App Ins.  PerGB2018 z dziennym limitem        dzienny limit ingestii chroni przed rachunkiem


targetScope = 'resourceGroup'

param baseName string = 'cstm-${uniqueString(resourceGroup().id)}'

param location string = resourceGroup().location

@allowed(['westeurope','westus2','centralus','eastus2','eastasia'])
param staticWebAppLocation string = 'westeurope'

@allowed(['F1','B1'])
param appServicePlanSku string = 'F1'

@secure()
param sqlAdminLogin string = 'cstmadmin'

@secure()
@minLength(12)
param sqlAdminPassword string

param clientIpAddress string = ''

param serviceBusQueueName string = 'ticket-events'

param tags object = {project:'cstm', enviroment: 'demo'}

var appServicePlanName = '${baseName}-plan'
var appServiceName = '${baseName}-api'
var sqlServerName = '${baseName}-sql'
var sqlDatabaseName = 'CSTMDb'
var keyValutName = '${baseName}-kv'
var serviceBusName = '${baseName}-bus'
var staticSiteName = '${baseName}-web'
var logAnaliticsName = '${baseName}-logs'
var appInsightsName = '${baseName}-insights'

var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'
var serviceBusDataSenderRoleId = '69a216fc-b8fb-44d8-bc22-1f3c2cd27a39'
var serviceBusDataReceiverRoleId = '4f6d3b9b-027b-4f4c-9142-0e5a2a2247e0'


//------------------------- Monitoring 
resource logAnaltics 'Microsoft.OperationalInsights/workspaces@2023-09-01' ={
  name: logAnaliticsName
  location: location
  tags: tags
  properties:{
    sku:{
      name: 'PerGB2018'
    }
    retentionInDays: 30
    workspaceCapping:{
      dailyQuotaGb:json('0.1')
    }
  }
}

resource appInsights 'Microsoft.Insights/components@2020-02-02' = {
  name: appInsightsName
  location: location
  tags: tags
  kind: 'web'
  properties: {
    Application_Type: 'web'
    WorkspaceResourceId: logAnaltics.id
  }
}

//--------frontend
resource staticSite 'Microsoft.Web/staticSites@2023-12-01' = {
  name: staticSiteName
  location: staticWebAppLocation
  tags: tags
  sku: {
    name: 'Free'
    tier: 'Free'
  }
  properties: {}
}

//-----------------Database
resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  tags:tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

resource sqlFirewallAllowAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties:{
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlFirewallClient 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = if (!empty(clientIpAddress)) {
  parent: sqlServer
  name: 'ClientId'
  properties:{
    startIpAddress: clientIpAddress
    endIpAddress: clientIpAddress
  }
}

resource sqlDatabase 'Microsoft.Sql/servers/databases@2023-08-01-preview' = {
  parent: sqlServer
  name: sqlDatabaseName
  location: location
  tags: tags
  sku: {
    name: 'GP_S_Gen5'
    tier: 'GeneralPurpose'
    family: 'Gen5'
    capacity: 1
  }
  properties: {
    useFreeLimit: true
    freeLimitExhaustionBehavior: 'AutoPause'
    autoPauseDelay:15
    maxSizeBytes:3435973868
    requestedBackupStorageRedundancy: 'Local'
  }
}

//-------------------ServiceBus
resource serviceBus 'Microsoft.ServiceBus/namespaces@2021-11-01' = {
  name: serviceBusName
  location: location
  tags: tags
  sku:{
    name:'Basic'
    tier:'Basic'
  }
  properties:{
    disableLocalAuth: true
    minimumTlsVersio: '1.2'
  }
}

resource ticketQueue 'Microsoft.ServiceBus/namespaces/queues@2021-11-01' = {
  parent: serviceBus
  name: serviceBusQueueName
  properties:{
    lockDuration: 'PT1M'
    maxDeliveryCount: 5
    defaultMessageTimeToLive: 'P1D'
  }
}

//------------ Key Vault
resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyValutName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization:true
    softDeleteRetentionInDays: 7
  }
}

resource sqlConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'SqlConnectionString'
  properties: {
    value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabaseName};User Id=${sqlAdminLogin};Password=${sqlAdminPassword};Encrypt=true;TrustServerCertificate=false;COnnection Timeout=60;'
  }
}

// ---------------------API
resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name:appServicePlanName
  location: location
  tags:tags
  kind: 'linux'
  sku: {
    name: appServicePlanSku
  }
  properties:{
    reserved: true
  }
}

resource appService 'Microsoft.Web/sites@2023-12-01' = {
  name: appServiceName
  location: location
  tags: tags
  kind: 'app,linux'
  identity: {
    type: 'SystemAssigned'
  }
  properties:{
    serverFarmId: appServicePlan.id
    httpsOnly:true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|10.0'
      alwaysOn: false
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings:[
        {
          name: 'KeyVaultName'
          value: keyVault.name
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          name: 'Cors__AllowedOrigins__0'
          value: 'https://${staticSite.properties.defaultHostname}'
        }
        {
          name: 'ServiceBus__Enabled'
          value: 'true'
        }
        {
          name: 'ServiceBus__FullyQuaifiedNamespace'
          value: '${serviceBus.name}.servicebus.windows.net'
        }
        {
          name: 'ServiceBus__QueueName'
          value: serviceBusQueueName
        }
      ]
    }
  }
}

//-------------------- Manage Identity 
resource keyValtSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' ={
  name: guid(keyVault.id, appService.id, keyVaultSecretsUserRoleId)
  scope:keyVault
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', keyVaultSecretsUserRoleId)
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource serviceBusSenderRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(ticketQueue.id, appService.id, serviceBusDataSenderRoleId)
  scope: ticketQueue
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', serviceBusDataSenderRoleId)
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

resource serviceBusReceiverRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(ticketQueue.id, appService.id, serviceBusDataReceiverRoleId)
  scope: ticketQueue
  properties: {
    roleDefinitionId: subscriptionResourceId('Microsoft.Authorization/roleDefinitions', serviceBusDataReceiverRoleId)
    principalId: appService.identity.principalId
    principalType: 'ServicePrincipal'
  }
}

//-----------------------outputs
output appServiceName string = appService.name
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output staticSiteName string = staticSite.name
output staticSiteUrl string = 'https://${staticSite.properties.defaultHostname}'
output sqlServerName string = sqlServer.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output keyVaultName string = keyVault.name
output serviceBusNamespace string = '${serviceBus.name}.servicebus.windows.net'
