1. Schedule is skipped and new resources are not created as long as schedule is disabled.
   Schedule is disabled when OpenStack tenant quota is reached.
   Schedule is not reactivated automatically whenever quota limit is increased or quota usage is decreased.
   Instead it is expected that user would manually reactivate schedule in this case.

2. Guaranteed time of backup retention is ignored as long as there are exceeding resources.
   It means that existing resources are deleted even if it is requested to be kept forever.
   Essentially, retention time and maximal number of resources attributes are mutually exclusive.

3. If user has decreased value of maximal number of resources,
   but exceeding resources have been already created, we would try to automatically delete
   exceeding resources before creating new resources.
   However, if new resource creation fails, old resources cannot be restored.

   Therefore, it is strongly advised to modify value of maximal number of resources very carefully.
   Also it is better to delete exceeding resources manually instead of relying on automatic deletion
   so that it is easier to explicitly select resources to be removed.

4. Actual execution of schedule depends on number of backup workers and their load.
   For example, even if schedule is expected to create new resources each hour,
   but all backup workers have not been available for 2 hours, only one resource would be created.
