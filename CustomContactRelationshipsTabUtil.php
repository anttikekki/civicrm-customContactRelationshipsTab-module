<?php

class CustomContactRelationshipsTabUtil {
  
  public static function getRelationshipIdsForContactId($contactId) {
    $contactId = (int) $contactId;
  
    $sql = "
      SELECT id
      FROM civicrm_relationship
      WHERE contact_id_a = $contactId 
         OR contact_id_b = $contactId
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $result[] = $dao->id;
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
      SELECT relationship_type_id, custom_field_label, display_order
      FROM civicrm_customContactRelationshipsTab_config
      ORDER BY relationship_type_id ASC, display_order ASC
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    $result = array();
    while ($dao->fetch()) {
      $row = array();
      $row["relationship_type_id"] = $dao->relationship_type_id;
      $row["custom_field_label"] = $dao->custom_field_label;
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
      $result[$relationshipTypeId] = static::getCustomFieldsValuesForCustomGroup($customGroup, $customFields[$customGroupId]);
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
      $row["relationship_type_id"] = $dao->extends_entity_column_value;
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
        $row[$selectColumn] = $dao->{$selectColumn};
      }
      $result[$dao->entity_id] = $row;
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
}