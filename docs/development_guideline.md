# Development guidelines

## Get data from backend to view

To get data from backend to view (and vice versa) 4(3) layers have to realized

#### Raw layer
Deepest layer that contains basic providers for communication with certain API endpoint(always only one!).
Usually providers for raw layer is realized as `ng-factory`. Example: `RawProject` from `projects-service.js`.

Recommended name: `Raw<ObjectName>`

#### Service layer
Optional layer that takes data from one or more raw layer providers and creates one complete object.
Providers for service layer are implemented as `ng-service`. Example: `ProjectsService` from `projects-service.js`.

Recommended name: `<ObjectsName>Service`

#### Controller layer
Uses providers from service layer to get or create objects with backend data.
It is possible to use raw layer providers - only if objects are really simple, don't require any additional data and there is no provider from service layer for this type of objects.

Recommended name: `<ObjectName><Actions>Controller`. Examples: `ProjectAddController`, `ProjectDetailUpdateController`

#### Views layer
Shows controllers attributes to users, allows users to modify them.


## Urls

 - list of objects: `/objects/`
 - list-level operation (example: add): `/objects/<operation>/`
 - one object: `/object/<uuid>/`
 - object-level operation (example: update): `/object/<uuid>/<operation>/`