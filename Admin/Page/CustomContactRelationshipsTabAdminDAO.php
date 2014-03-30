<?php

/**
* DAO for saving and deleting CustomContactRelationshipsTa extension configuration rows.
*/
class CustomContactRelationshipsTabAdminDAO {
  
  /**
  * Checks if configuration rows exists for given primary keys.
  *
  * @param int|string $relationship_type_id Relationship type id
  * @param int|string $custom_field_id Custom field id
  * @return boolean True if row exists, else false.
  */
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

  /**
  * Saves configuration row. Updates old row if it exists. Creates new row if old is not found.
  *
  * @param array $row Array of parameters for save. Required parameters: relationship_type_id, custom_field_id and display_order.
  * @return string. "ok" if save was succesfull. All other return values are error messages.
  */
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
  
  /**
  * Creates new configuration row.
  *
  * @param array $row Array of parameters for save. Required parameters: relationship_type_id, custom_field_id and display_order.
  */
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
  
  /**
  * Updates old configuration row.
  *
  * @param array $row Array of parameters for save. Required parameters: relationship_type_id, custom_field_id and display_order.
  * @param int|string $old_relationship_type_id Orinal Relationship type id
  * @param int|string $old_custom_field_id Original Custom field id
  */
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
  
  /**
  * Deletes configuration row-
  *
  * @param array $row Array of parameters for save. Required parameters: relationship_type_id and custom_field_id.
  */
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