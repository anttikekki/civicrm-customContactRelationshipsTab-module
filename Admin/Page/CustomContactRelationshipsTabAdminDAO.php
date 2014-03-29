<?php

class CustomContactRelationshipsTabAdminDAO {
  public static function getConfigRow($relationship_type_id, $custom_field_id) {
    $relationship_type_id = (int) $relationship_type_id;
    $custom_field_id = (int) $custom_field_id;
  
    $sql = "
      SELECT relationship_type_id, custom_field_id, display_order
      FROM civicrm_customContactRelationshipsTab_config
      WHERE relationship_type_id = $relationship_type_id
        AND custom_field_id = $custom_field_id
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    
    if($dao->fetch()) {
      $row = array();
      $row["relationship_type_id"] = $dao->relationship_type_id;
      $row["custom_field_id"] = $dao->custom_field_id;
      $row["display_order"] = $dao->display_order;
      return $row;
    }
    return NULL;
  }
  
  public static function configRowExists($relationship_type_id, $custom_field_id) {
    $relationship_type_id = (int) $relationship_type_id;
    $custom_field_id = (int) $custom_field_id;
  
    $sql = "
      SELECT relationship_type_id
      FROM civicrm_customContactRelationshipsTab_config
      WHERE relationship_type_id = $relationship_type_id
        AND custom_field_id = $custom_field_id
    ";
    $dao = CRM_Core_DAO::executeQuery($sql);
    return $dao->fetch();
  }

  public static function saveConfigRow($row) {
    //Update old row, primary key stays the same
    if($row["relationship_type_id"] == $row["old_relationship_type_id"] && $row["custom_field_id"] == $row["old_custom_field_id"]) {
      static::updateConfigRow($row, $row["old_relationship_type_id"], $row["old_custom_field_id"]);
    }
    //Updating old row, primary key changes
    else if(static::configRowExists($row["old_relationship_type_id"], $row["old_custom_field_id"])) {
      if(static::configRowExists($row["relationship_type_id"], $row["custom_field_id"])) {
        return "Configuration row allready exists!";
      }
      static::updateConfigRow($row, $row["old_relationship_type_id"], $row["old_custom_field_id"]);
    }
    //Creating new row
    else {
      if(static::configRowExists($row["relationship_type_id"], $row["custom_field_id"])) {
        return "Configuration row allready exists!";
      }
      static::createConfigRow($row);
    }
    
    return "ok";
  }
  
  public static function createConfigRow($row) {
    $relationship_type_id = (int) $row["relationship_type_id"];
    $custom_field_id = (int) $row["custom_field_id"];
    $display_order = (int) $row["display_order"];
  
    $sql = "
      INSERT INTO civicrm_customContactRelationshipsTab_config (
        relationship_type_id, 
        custom_field_id, 
        display_order)
      VALUES($relationship_type_id, $custom_field_id, $display_order)
    ";
    CRM_Core_DAO::executeQuery($sql);
  }
  
  public static function updateConfigRow($row, $old_relationship_type_id, $old_custom_field_id) {
    $relationship_type_id = (int) $row["relationship_type_id"];
    $custom_field_id = (int) $row["custom_field_id"];
    $display_order = (int) $row["display_order"];
    $old_relationship_type_id = (int) $old_relationship_type_id;
    $old_custom_field_id = (int) $old_custom_field_id;
  
    $sql = "
      UPDATE civicrm_customContactRelationshipsTab_config
      SET relationship_type_id = $relationship_type_id, 
          custom_field_id = $custom_field_id, 
          display_order = $display_order
      WHERE relationship_type_id = $old_relationship_type_id
        AND custom_field_id = $old_custom_field_id
    ";
    CRM_Core_DAO::executeQuery($sql);
  }
  
  public static function deleteConfigRow($row) {
    $relationship_type_id = (int) $row["relationship_type_id"];
    $custom_field_id = (int) $row["custom_field_id"];
  
    $sql = "
      DELETE FROM civicrm_customContactRelationshipsTab_config
      WHERE relationship_type_id = $relationship_type_id
        AND custom_field_id = $custom_field_id
    ";
    CRM_Core_DAO::executeQuery($sql);
  }
}