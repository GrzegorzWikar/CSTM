// CSTM - infrastruktura Azure zaprojektowana pod minimalny koszt (cel: ~0 USD / mies. przy malym ruchu).
//
//  Zasob                     Plan / SKU                          Koszt
//  ------------------------  ----------------------------------  ------------------------------------------
//  App Service (API)         F1 Free (Linux)                     0; limit CPU na dobe, brak Always On
//  Azure SQL Database        Serverless + darmowa oferta         0; po wyczerpaniu limitu baza sie PAUZUJE
//  Static Web Apps (front)   Free                                0
//  Service Bus               Basic + kolejka ticket-events       grosze (platne za operacje, brak oplaty stalej)
//  Key Vault                 Standard                            grosze (platne za operacje, brak oplaty stalej)
//  Log Analytics + App Ins.  PerGB2018 z dziennym limitem        dzienny limit ingestii chroni przed rachunkiem
//
// Budzet z alertem mailowym: osobny plik budget.bicep (wdroz go PRZED tym plikiem).

targetScope = 'resourceGroup'

@description('Prefiks nazw zasobow. Domyslnie unikalny dla grupy zasobow. Key Vault ma limit 24 znakow na nazwe, wiec prefiks nie moze byc dlugi.')
param baseName string = 'cstm-${uniqueString(resourceGroup().id)}'

param location string = resourceGroup().location

@description('Static Web Apps (plan Free) dziala tylko w wybranych regionach - to nie musi byc ten sam region co reszta.')
@allowed([
  'westeurope'
  'westus2'
  'centralus'
  'eastus2'
  'eastasia'
])
param staticWebAppLocation string = 'westeurope'

@description('F1 = darmowy. B1 = platny (ok. 13 USD / mies.) - uzyj tylko awaryjnie, gdy F1 jest niedostepny w regionie.')
@allowed([
  'F1'
  'B1'
])
param appServicePlanSku string = 'F1'

param sqlAdminLogin string = 'cstmadmin'

@secure()
@minLength(12)
@description('Haslo admina SQL. Uzywaj tylko liter i cyfr - trafia do connection stringa (znaki ; i = by go zepsuly).')
param sqlAdminPassword string

@description('Twoj publiczny adres IP - otwiera firewall SQL, zebys mogl uruchomic migracje EF z komputera. Puste = brak reguly.')
param clientIpAddress string = ''

param serviceBusQueueName string = 'ticket-events'

param tags object = {
  project: 'cstm'
  environment: 'demo'
}

var appServicePlanName = '${baseName}-plan'
var appServiceName = '${baseName}-api'
var sqlServerName = '${baseName}-sql'
var sqlDatabaseName = 'CSTMDb'
var keyVaultName = '${baseName}-kv'
// Nazwa namespace Service Bus nie moze konczyc sie na "-sb" ani "-mgmt" (zarezerwowane przyrostki).
var serviceBusName = '${baseName}-bus'
var staticSiteName = '${baseName}-web'
var logAnalyticsName = '${baseName}-logs'
var appInsightsName = '${baseName}-insights'

// Wbudowane role Azure RBAC (GUID-y sprawdzone w dokumentacji Microsoft).
var keyVaultSecretsUserRoleId = '4633458b-17de-408a-b874-0445c86b69e6'
var serviceBusDataSenderRoleId = '69a216fc-b8fb-44d8-bc22-1f3c2cd27a39'
var serviceBusDataReceiverRoleId = '4f6d3b9b-027b-4f4c-9142-0e5a2a2247e0'

// ---------------------------------------------------------------- monitoring

resource logAnalytics 'Microsoft.OperationalInsights/workspaces@2023-09-01' = {
  name: logAnalyticsName
  location: location
  tags: tags
  properties: {
    sku: {
      name: 'PerGB2018'
    }
    retentionInDays: 30
    workspaceCapping: {
      // Twardy dzienny limit ingestii (0,1 GB = ok. 3 GB / mies.). Po przekroczeniu logi nie sa zbierane do konca doby.
      dailyQuotaGb: json('0.1')
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
    WorkspaceResourceId: logAnalytics.id
  }
}

// ---------------------------------------------------------------- frontend

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

// ---------------------------------------------------------------- baza danych

resource sqlServer 'Microsoft.Sql/servers@2023-08-01-preview' = {
  name: sqlServerName
  location: location
  tags: tags
  properties: {
    administratorLogin: sqlAdminLogin
    administratorLoginPassword: sqlAdminPassword
    version: '12.0'
    minimalTlsVersion: '1.2'
    publicNetworkAccess: 'Enabled'
  }
}

// 0.0.0.0 - 0.0.0.0 = "zezwol uslugom Azure" (w tym App Service).
resource sqlFirewallAllowAzure 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = {
  parent: sqlServer
  name: 'AllowAzureServices'
  properties: {
    startIpAddress: '0.0.0.0'
    endIpAddress: '0.0.0.0'
  }
}

resource sqlFirewallClient 'Microsoft.Sql/servers/firewallRules@2023-08-01-preview' = if (!empty(clientIpAddress)) {
  parent: sqlServer
  name: 'ClientIp'
  properties: {
    startIpAddress: clientIpAddress
    endIpAddress: clientIpAddress
  }
}

// Darmowa oferta Azure SQL Database: General Purpose serverless, 100 000 vCore-sekund i 32 GB miesiecznie.
// AutoPause = po wyczerpaniu limitu baza jest wstrzymana do konca miesiaca (NIE naliczaja sie oplaty).
// NIGDY nie zmieniaj tego na BillOverUsage - wtedy nadwyzka jest platna, a powrotu do AutoPause nie ma.
// Przy AutoPause Azure dopuszcza tylko domyslny czas bezczynnosci przed pauza (autoPauseDelay nie wolno ustawiac),
// a maksymalny rozmiar musi byc w granicach oferty (32 GB) - inaczej wdrozenie konczy sie bledem.
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
    maxSizeBytes: 34359738368 // 32 GB
    requestedBackupStorageRedundancy: 'Local'
  }
}

// ---------------------------------------------------------------- Service Bus

resource serviceBus 'Microsoft.ServiceBus/namespaces@2021-11-01' = {
  name: serviceBusName
  location: location
  tags: tags
  sku: {
    name: 'Basic'
    tier: 'Basic'
  }
  properties: {
    // Tylko logowanie przez Entra ID / Managed Identity - zadnych kluczy dostepu, ktore moglyby wyciec.
    // Lokalnie uzywasz emulatora (ServiceBus:ConnectionString), wiec to nie przeszkadza.
    disableLocalAuth: true
  }
}

resource ticketQueue 'Microsoft.ServiceBus/namespaces/queues@2021-11-01' = {
  parent: serviceBus
  name: serviceBusQueueName
  properties: {
    lockDuration: 'PT1M'
    maxDeliveryCount: 5
    defaultMessageTimeToLive: 'P1D'
  }
}

// ---------------------------------------------------------------- Key Vault

resource keyVault 'Microsoft.KeyVault/vaults@2023-07-01' = {
  name: keyVaultName
  location: location
  tags: tags
  properties: {
    sku: {
      family: 'A'
      name: 'standard'
    }
    tenantId: subscription().tenantId
    enableRbacAuthorization: true
    // Najkrotsza dozwolona retencja usunietych sekretow - krocej blokuje nazwe po usunieciu grupy zasobow.
    softDeleteRetentionInDays: 7
  }
}

resource sqlConnectionStringSecret 'Microsoft.KeyVault/vaults/secrets@2023-07-01' = {
  parent: keyVault
  name: 'SqlConnectionString'
  properties: {
    // Connection Timeout=60: pierwsze polaczenie po pauzie bazy serverless ja wznawia, co trwa do ok. minuty.
    value: 'Server=tcp:${sqlServer.properties.fullyQualifiedDomainName},1433;Initial Catalog=${sqlDatabaseName};User ID=${sqlAdminLogin};Password=${sqlAdminPassword};Encrypt=true;TrustServerCertificate=false;Connection Timeout=60;'
  }
}

// ---------------------------------------------------------------- API

resource appServicePlan 'Microsoft.Web/serverfarms@2023-12-01' = {
  name: appServicePlanName
  location: location
  tags: tags
  kind: 'linux'
  sku: {
    name: appServicePlanSku
  }
  properties: {
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
  properties: {
    serverFarmId: appServicePlan.id
    httpsOnly: true
    siteConfig: {
      linuxFxVersion: 'DOTNETCORE|10.0'
      alwaysOn: false // F1 nie obsluguje Always On
      ftpsState: 'Disabled'
      minTlsVersion: '1.2'
      appSettings: [
        {
          name: 'KeyVaultName'
          value: keyVault.name
        }
        {
          name: 'APPLICATIONINSIGHTS_CONNECTION_STRING'
          value: appInsights.properties.ConnectionString
        }
        {
          // Klucz w Program.cs musi nazywac sie dokladnie "Cors:AllowedOrigins" (patrz instrukcja).
          name: 'Cors__AllowedOrigins__0'
          value: 'https://${staticSite.properties.defaultHostname}'
        }
        {
          name: 'ServiceBus__Enabled'
          value: 'true'
        }
        {
          name: 'ServiceBus__FullyQualifiedNamespace'
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

// ---------------------------------------------------------------- uprawnienia (Managed Identity API)

resource keyVaultSecretsUserRole 'Microsoft.Authorization/roleAssignments@2022-04-01' = {
  name: guid(keyVault.id, appService.id, keyVaultSecretsUserRoleId)
  scope: keyVault
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

// ---------------------------------------------------------------- outputs

output appServiceName string = appService.name
output appServiceUrl string = 'https://${appService.properties.defaultHostName}'
output staticSiteName string = staticSite.name
output staticSiteUrl string = 'https://${staticSite.properties.defaultHostname}'
output sqlServerName string = sqlServer.name
output sqlServerFqdn string = sqlServer.properties.fullyQualifiedDomainName
output sqlDatabaseName string = sqlDatabase.name
output keyVaultName string = keyVault.name
output serviceBusNamespace string = '${serviceBus.name}.servicebus.windows.net'
