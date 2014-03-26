<?php

class CustomContactRelationshipsTabAjaxPage {
  public static function getData() {
    $contactId = (int) $_GET["contactId"];
    $result = [];
     
    //Add relationship custom field values
    $customFieldValues = CustomContactRelationshipsTabUtil::getRelationshipTypeCustomFieldsValues();
    $result["customFieldValues"] = $customFieldValues;
    
    //Add visible custom field configs
    $visibleCustomFieldsConfig = CustomContactRelationshipsTabUtil::getRelationshipVisibleCustomFieldsFromConfig();
    $result["visibleCustomFieldsConfig"] = $visibleCustomFieldsConfig;
    
    //Add Contact relationships
    $relationshipTypeForRelationshipId = CustomContactRelationshipsTabUtil::getRelationshipsForContactId($contactId);
    $result["relationshipTypeForRelationshipId"] = $relationshipTypeForRelationshipId;
  
    echo json_encode($result);
    CRM_Utils_System::civiExit();
  }
}