civicrm-customContactRelationshipsTab-module
============================================

CiviCRM Contact Summary Relationships tab customization. Divides relationships to separate table by relationship type. Shows relationship type spesific custom field values in datatable columns.

#### Configuration
Relationship custom field values visible in tables can be configured. Extension has own configuration database table `civicrm_customContactRelationshipsTab_config` where configurations are saved. Configurations can be edited in extension admin screen in Administer -> CustomContactRelationshipTab -> Settings.

Configurations need following data for every visible custom field column:
* _Relationship type_: Type of relationship. Every table has only one relationship type relationship rows.
* _Custom group_: Custom group that belongs to relationship type.
* _Custom field_: Custom field. This data is displayed in column.
* _Order number_: Ordering of visible fields in this relationship type table.

#### Version history
Version history and changelog is available in [Releases](https://github.com/anttikekki/civicrm-customContactRelationshipsTab-module/releases). 

#### Installation
1. Create `com.github.anttikekki.customContactRelationshipsTab` folder to CiviCRM extension folder, copy all files into it and enable extension in administration.
2. Rebuild navigation menu. Go to Administer -> System Settings -> Cleanup Caches and Update Paths and push `Cleanup caches`
3. Edit configuration in Administer -> CustomContactRelationshipTab -> Settings

#### Licence
GNU Affero General Public License
