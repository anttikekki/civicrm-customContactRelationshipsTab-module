<?php

/**
* Helper Util CustomContactRelationshipsTab-extension to handle all database queries.
*/
class CustomContactRelationshipsTabUtil {
  
  /**
  * Find all relationship ids for contact id.
  *
  * @param int|string $contactId Contact id
  * @return array Array where key is relationship id and value is relationship type id
  */
  public static function getRelationshipsForContactId($contactId) {
    $contactId = (int) $contactId;
  
    $sql = "
      SELECT id, relationship_type_id
      FROM civicrm_relationship
      WHERE contact_id_a = $contactId 
         OR contact_id_b = $contactId
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $result[$dao->id] = $dao->relationship_type_id;
    }
    
    return $result;
  }
  
  /**
  * Find all relationship type ids for contact id.
  *
  * @param int|string $contactId Contact id
  * @return array Array of relationship type ids
  */
  public static function getRelationshipTypeIdsForContactId($contactId) {
    $contactId = (int) $contactId;
  
    $sql = "
      SELECT UNIQUE relationship_type_id
      FROM civicrm_relationship
      WHERE contact_id_a = $contactId 
         OR contact_id_b = $contactId
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $result[] = $dao->relationship_type_id;
    }
    return $result;
  }
  
  /**
  * Find all relationship type id and name for given relationship ids.
  *
  * @param array $relationshipTypeIds Relationship type ids
  * @return array Array where key is relationship type id and value is relationship type name
  */
  public static function getRelationshipTypes($relationshipTypeIds = NULL) {
    $sql = "
      SELECT id, label_a_b
      FROM civicrm_relationship_type
    ";
    
    if(is_array($relationshipTypeIds)) {
      if(count($relationshipTypeIds) == 0) {
        return array();
      }
      $relationshipTypeIds = array_filter($relationshipTypeIds, "is_numeric");
      
      $sql .= "WHERE id IN(". implode(",", $relationshipTypeIds) .")";
    }
    
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $result[$dao->id] = $dao->label_a_b;
    }
    return $result;
  }
  
  /**
  * Load all confidurations from civicrm_customContactRelationshipsTab_config table.
  *
  * @return array Array of arrays. Every array row contains following fields: relationship_type_id, custom_field_id, custom_field_label, custom_field_data_type, display_order
  */
  public static function getRelationshipVisibleCustomFieldsFromConfig() {
    $sql = "
      SELECT config.relationship_type_id, 
             config.custom_field_id, 
             civicrm_custom_field.label, 
             civicrm_custom_field.data_type, 
             config.display_order
      FROM civicrm_customContactRelationshipsTab_config AS config
      LEFT JOIN civicrm_custom_field ON (civicrm_custom_field.id = config.custom_field_id)
      ORDER BY config.relationship_type_id ASC, config.display_order ASC
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $row = array();
      $row["relationship_type_id"] = $dao->relationship_type_id;
      $row["custom_field_id"] = $dao->custom_field_id;
      $row["custom_field_label"] = $dao->label;
      $row["custom_field_data_type"] = $dao->data_type;
      $row["display_order"] = $dao->display_order;
      $result[] = $row;
    }
    
    return $result;
  }
  
  /**
  * Find all given relationships custom field values.
  *
  * @param array $relationshipIds Relationship ids
  * @return array Array where key is relationship type id in form 'relationshipTypeId_XX'. Value is array of custom field values for every relationship id.
  */
  public static function getRelationshipTypeCustomFieldsValues($relationshipIds) {
    $customGroups = static::getCustomGroupsForRelationshipTypes();
    $customFields = static::getCustomFieldsForCustomGroups($customGroups);
    
    $result = array();
    foreach ($customGroups as $index => &$customGroup) {
      $customGroupId = (int) $customGroup["id"];
      $relationshipTypeId = $customGroup["relationship_type_id"];
      $key = "relationshipTypeId_$relationshipTypeId";
      $result[$key] = static::getCustomFieldsValuesForCustomGroup($customGroup, $customFields[$customGroupId], $relationshipIds);
    }
    
    return $result;
  }
  
  /**
  * Find all Custom Groups that belong to Relationships.
  *
  * @return array Array where key is custom group id and value is array with following fields: id, title, relationship_type_id, table_name
  */
  public static function getCustomGroupsForRelationshipTypes() {
    $sql = "
      SELECT id, title, extends_entity_column_value, table_name
      FROM civicrm_custom_group
      WHERE extends = 'Relationship'
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $row = array();
      $row["id"] = $dao->id;
      $row["title"] = $dao->title;
      //WTF!!! extends_entity_column_value contains SOH control character!
      $row["relationship_type_id"] = preg_replace('/[\x00-\x1F\x7F]/', '', $dao->extends_entity_column_value);
      $row["table_name"] = $dao->table_name;
      $result[$dao->id] = $row;
    }
    
    return $result;
  }
  
  /**
  * Find all custom fields for every given custom groups.
  *
  * @param array $customGroups Array of custom group info arrays with following fields: id, title, relationship_type_id, table_name
  * @return array Array where key is custom group id and value is array of custom group custom fields info arrays with following field: id, custom_group_id, label, data_type, column_name
  */
  public static function getCustomFieldsForCustomGroups($customGroups) {
    $result = array();
    foreach ($customGroups as $index => &$customGroup) {
      $customGroupId = (int) $customGroup["id"];
      $result[$customGroupId] = static::getCustomFieldsForCustomGroupId($customGroupId);
    }
    return $result;
  }
  
  /**
  * Find all custom fields for given custom group.
  *
  * @param array $customGroup Custom group info array with following fields: id, title, relationship_type_id, table_name
  * @return array Array where key is custom field id and value is array with following field: id, custom_group_id, label, data_type, column_name
  */
  public static function getCustomFieldsForCustomGroupId($customGroupId) {
    $customGroupId = (int) $customGroupId;
  
    $sql = "
      SELECT id, custom_group_id, label, data_type, column_name
      FROM civicrm_custom_field
      WHERE custom_group_id = $customGroupId
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $row = array();
      $row["id"] = $dao->id;
      $row["custom_group_id"] = $dao->custom_group_id;
      $row["label"] = $dao->label;
      $row["data_type"] = $dao->data_type;
      $row["column_name"] = $dao->column_name;
      $result[$dao->id] = $row;
    }
    
    return $result;
  }
  
  /**
  * Find all custom fields values for custom group.
  *
  * @param array $customGroup Custom group info array with following fields: id, title, relationship_type_id, table_name
  * @param array $customGroupFields Array of Custom fields info arrays with following field: id, custom_group_id, label, data_type, column_name
  * @return array Array where key is relationship id in form 'relationshipId_XX'. Value is array with 'relationship_id' key and all custom field values with key of custom field id.
  */
  public static function getCustomFieldsValuesForCustomGroup($customGroup, $customGroupFields, $relationshipIds) {
    $selectColumns = static::getCustomFieldTableSelectColumns($customGroupFields);
    $customFieldIdForColumnNameMap = static::getCustomFieldIdForColumnNameMap($customGroupFields);
  
    if(count($selectColumns) == 0 || count($relationshipIds) == 0) {
      return array();
    }
  
    $sql = "
      SELECT entity_id, ". implode(",", $selectColumns) ."
      FROM ".$customGroup["table_name"]."
      WHERE entity_id IN(". implode(",", $relationshipIds) .")
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    $row;
    while ($dao->fetch()) {
      $row = array();
      $row["relationship_id"] = $dao->entity_id;
      foreach ($selectColumns as $index => $selectColumn) {
        $customFieldId = $customFieldIdForColumnNameMap[$selectColumn];
        $row[$customFieldId] = $dao->{$selectColumn};
      }
      $result["relationshipId_".$dao->entity_id] = $row;
    }
    
    return $result;
  }
  
  /**
  * Find all custom field column names.
  *
  * @param array $customGroupFields Array of Custom fields info arrays with following field: id, custom_group_id, label, data_type, column_name
  * @return array Array of Custom field valu tables column names.
  */
  public static function getCustomFieldTableSelectColumns($customGroupFields) {
    $result = array();
    foreach ($customGroupFields as $index => &$customGroupField) {
      $result[] = $customGroupField["column_name"];
    }
    return $result;
  }
  
  /**
  * Get array where key is Custom field value column name and value is custom field id
  *
  * @param array $customGroupFields Array of Custom fields info arrays with following field: id, custom_group_id, label, data_type, column_name
  * @return array Array where key is Custom field value column name and value is custom field id
  */
  public static function getCustomFieldIdForColumnNameMap($customGroupFields) {
    $result = array();
    foreach ($customGroupFields as $index => &$customGroupField) {
      $result[$customGroupField["column_name"]] = $customGroupField["id"];
    }
    return $result;
  }
}