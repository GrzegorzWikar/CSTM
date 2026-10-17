targetScope = 'resourceGroup'

param alertEmail string

param monthlyBudget int = 5

param budgetName string = 'cstm-monthly-budget'

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
      Actual_GreatherThan_50_Percent:{
        enabled: true
        operator: 'GreaterThan'
        threshold: 50
        thresholdType: 'Actual'
        contactEmails: [
          alertEmail
        ]
      }
      Actual_GreatherThan_90_Percent:{
        enabled: true
        operator: 'GreaterThan'
        threshold: 90
        thresholdType: 'Actual'
        contactEmails: [
          alertEmail
        ]
      }
      Actual_GreatherThan_100_Percent: {
        enabled: true
        operator: 'GreaterThan'
        threshold: 100
        thresholdType: 'Forecasted'
        contactEmails:[
          alertEmail
        ]
      }
    }
  }
}
