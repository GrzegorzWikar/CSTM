// Budzet kosztowy dla grupy zasobow projektu CSTM - wdrazaj go PRZED main.bicep.
//
// Uwaga: budzet to ALARM (mail), a nie hamulec - niczego sam nie wylacza.
// Dane kosztowe w Azure maja kilku- do kilkunastogodzinne opoznienie, wiec mail moze przyjsc z lekkim poslizgiem.
// Kwota jest w walucie rozliczeniowej subskrypcji.

targetScope = 'resourceGroup'

@description('Adres e-mail, na ktory maja przychodzic alerty kosztowe.')
param alertEmail string

@description('Miesieczny limit kosztow dla tej grupy zasobow.')
param monthlyBudget int = 5

param budgetName string = 'cstm-monthly-budget'

// Budzet musi startowac od pierwszego dnia miesiaca. utcNow() mozna uzyc tylko jako wartosci domyslnej parametru.
param startMonth string = utcNow('yyyy-MM')

resource budget 'Microsoft.Consumption/budgets@2023-05-01' = {
  name: budgetName
  properties: {
    category: 'Cost'
    amount: monthlyBudget
    timeGrain: 'Monthly'
    timePeriod: {
      startDate: '${startMonth}-01T00:00:00Z'
    }
    notifications: {
      Actual_GreaterThan_50_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        thresholdType: 'Actual'
        contactEmails: [
          alertEmail
        ]
      }
      Actual_GreaterThan_90_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 90
        thresholdType: 'Actual'
        contactEmails: [
          alertEmail
        ]
      }
      Forecasted_GreaterThan_100_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails: [
          alertEmail
        ]
      }
    }
  }
}
