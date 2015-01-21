# Development guidelines

## Get data from backend to view

To get data from backend to view (and vice versa) 4(3) layers have to realized

#### Raw layer
Deepest layer that realize basic providers for communication with certain API endpoint.
Usually providers for raw layer is realized as `ng-factory`. Example: `RawProject` from `projects-service.js`.

Recommended name: `Raw<ObjectName>`

#### Service layer
Optional layer that takes data from one or more raw layer providers and creates one complete object.
Providers for service layer is realized as `ng-service`. Example: `ProjectsService` from `projects-service.js`.

Recommended name: `<ObjectsName>Service`

#### Controller layer
Uses providers from service layer to get or create objects with backend data.
It is possible to use raw layer providers - only if objects is really simple and doesn't required any additional data and there is no provider from service layer for such type of objects.

Recommended name: `<ObjectName><Actions>Controller`. Examples: `ProjectAddController`, `ProjectDetailUpdateController`

#### Views layer
Shows controllers attributes to users, allows users to modify them.