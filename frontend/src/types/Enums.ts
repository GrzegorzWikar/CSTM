export enum Severity {
    Sev1 = 0,
    Sev2 = 1,
    Sev3 = 2,
    Sev4 = 3,
}

export const SeverityLables: Record<Severity, string> ={
    [Severity.Sev1]: 'Sev 1',
    [Severity.Sev2]: 'Sev 2',
    [Severity.Sev3]: 'Sev 3',
    [Severity.Sev4]: 'Sev 4',
};

export enum Status{
    New = 0,
    Assigned = 1,
    InProgress = 2,
    WaitingForCustomer = 3,
    Resolved = 4,
    Closed = 5,
}

export const StatusLabels: Record<Status, string> = {
    [Status.New]: 'New',
    [Status.Assigned]: 'Assigned',
    [Status.InProgress]: 'In Progress',
    [Status.WaitingForCustomer]: 'Waiting for Customer',
    [Status.Resolved]: 'Resolved',
    [Status.Closed]: 'Closed',
};