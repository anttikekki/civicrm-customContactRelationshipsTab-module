<?php

class CustomContactRelationshipsTabUtil {
  
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
  
  public static function getRelationshipTypeIdsForContactId($contactId) {
    $contactId = (int) $contactId;
  
    $sql = "
      SELECT relationship_type_id
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
  
  public static function getRelationshipVisibleCustomFieldsFromConfig() {
    $sql = "
      SELECT config.relationship_type_id, config.custom_field_id, civicrm_custom_field.label, config.display_order
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
      $row["display_order"] = $dao->display_order;
      $result[] = $row;
    }
    
    return $result;
  }
  
  public static function getRelationshipTypeCustomFieldsValues() {
    $customGroups = static::getCustomGroupsForRelationshipTypes();
    $customFields = static::getCustomFieldsForCustomGroups($customGroups);
    
    $result = array();
    foreach ($customGroups as $index => &$customGroup) {
      $customGroupId = (int) $customGroup["id"];
      $relationshipTypeId = $customGroup["relationship_type_id"];
      $key = "relationshipTypeId_$relationshipTypeId";
      $result[$key] = static::getCustomFieldsValuesForCustomGroup($customGroup, $customFields[$customGroupId]);
    }
    
    return $result;
  }
  
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
  
  public static function getCustomFieldsForCustomGroups($customGroups) {
    $result = array();
    foreach ($customGroups as $index => &$customGroup) {
      $customGroupId = (int) $customGroup["id"];
      $result[$customGroupId] = static::getCustomFieldsForCustomGroupId($customGroupId);
    }
    
    return $result;
  }
  
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
  
  public static function getCustomFieldsValuesForCustomGroup($customGroup, $customGroupFields) {
    $selectColumns = static::getCustomFieldTableSelectColumns($customGroupFields);
    $customFieldIdForColumnNameMap = static::getCustomFieldIdForColumnNameMap($customGroupFields);
  
    $sql = "
      SELECT entity_id, ". implode(",", $selectColumns) ."
      FROM ".$customGroup["table_name"]."
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
  
  public static function getCustomFieldTableSelectColumns($customGroupFields) {
    $result = array();
    foreach ($customGroupFields as $index => &$customGroupField) {
      $result[] = $customGroupField["column_name"];
    }
    return $result;
  }
  
  public static function getCustomFieldIdForColumnNameMap($customGroupFields) {
    $result = array();
    foreach ($customGroupFields as $index => &$customGroupField) {
      $result[$customGroupField["column_name"]] = $customGroupField["id"];
    }
    return $result;
  }
}