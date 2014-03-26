civicrm-customContactRelationshipsTab-module
============================================

CiviCRM Contact Summary Relationships tab customization. Divides relationships to separate table by relationship type. Shows relationship type spesific custom field values in datatable columns.

#### Configuration
Relationship custom field values visible in tables can be configured. Extension has own configuration database table `civicrm_customContactRelationshipsTab_config` where configurations are saved. Configurations have to inserted by hand directly to database table.

Configurations need following data for every visible cistom field column:
* _Relationship type id_: Type of relationship. Every table has only one relationship type relationship rows.
* _Custom field id_: Custom field id. This data is displayed in column.
* _Order number_: Ordering of visible fields in this relationship type table.

#### Version history
Version history and changelog is available in [Releases](https://github.com/anttikekki/civicrm-customContactRelationshipsTab-module/releases). 

#### Installation
1. Create `com.github.anttikekki.customContactRelationshipsTab` folder to CiviCRM extension folder, copy all files into it and enable extension in administration.
2. Insert configuration rows to this module configuration table `civicrm_customContactRelationshipsTab_config`.
3. Rebuild navigation menu. Go to Administer -> System Settings -> Cleanup Caches and Update Paths and push `Cleanup caches`

#### Licence
GNU Affero General Public License
