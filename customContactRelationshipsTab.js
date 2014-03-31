/**
* Modifies Contact Relationships tables by hiding originals and dividing rows for separate table based on Relationship type. 
* Every table shows custom field data spesific to that Relationship type.
*/

/*
* Init logic directly if Relationship edit or view Page is open. This page does not contain form 
* so table modification can start when DOM is ready.
*/
if(document.URL.indexOf('civicrm/contact/view/rel') !== -1) {
  cj(function ($) {
    var util = new CustomContactRelationshipsTabUtil();
    util.hideOriginalDatatables();
    util.loadExtensionData();
  });
}
/*
* Contact summary page is displayed. Relationships tab may not be selected so we need to wait and listen 
* when the tab is populated. Init tabe modification after Relationship tab page is loaded with Ajax.
*/
else if(document.URL.indexOf('civicrm/contact/view') !== -1) {
  cj(document).ajaxComplete(function( event, xhr, settings ) {
    if(settings.url.indexOf('civicrm/contact/view/rel') !== -1) {
      var util = new CustomContactRelationshipsTabUtil();
      util.relationshipTabIsLoaded();
    }
  });
}

/**
* Util to encapsulate all logic related to datatable modification.
*/
function CustomContactRelationshipsTabUtil() {

  /**
  * Extension data loaded with Ajax from CustomContactRelationshipsTabAjaxPage.php.
  */
  this.extensionData = null;
  
  /**
  * Start table modification. Creates new datatables.
  */
  this.start = function() {
    var relationshipIds = this.getTableRowsRelationshipIds();
    var relationshipIdsForRelationshipType = this.groupRelationshipIdsByRelationshipType(relationshipIds);
    this.buildNewDatatablesForRelationshipTypes(relationshipIdsForRelationshipType);
    
    //Move info label to bottom
    cj('#current-relationships').parent().append(cj('#permission-legend'));
    cj('#permission-legend').show();
  };
  
  /**
  * Loads extension data with Ajax from CustomContactRelationshipsTabAjaxPage.php. Calls start() after succesfull Ajax.
  */
  this.loadExtensionData = function() {
    var util = this;
    cj.get(CRM.customContactRelationshipsTab.ajaxURL.replace(/&amp;/g, '&'), function( data ) {
      util.extensionData = JSON.parse(data);
      util.start();
    });
  };
  
  /**
  * This method is called when Contact Summary Relationship tab is loaded from server with Ajax.
  */
  this.relationshipTabIsLoaded = function() {
    var util = this;
    
    /*
    * We need to wait that CiviCRM logic displays loaded html in tab before we start to modify it. One 
    * millisecod wait puts this to be executed after all currently executing logic.
    */
    setTimeout(function() {
      util.hideOriginalDatatables();
      util.loadExtensionData();
    }, 1);
  };
  
  /**
  * Hide default datatables so they dont show at the same time with new custom tables.
  */
  this.hideOriginalDatatables = function() {
    cj('#current-relationships, #inactive-relationships').hide();
    cj('#permission-legend').hide();
  };
  
  /**
  * Gets all extension configuration for given Relationship type id. 
  * Config means Custom field info for every visible column in datatable.
  *
  * @param {string} relationshipTypeId Relationship type id.
  * @return {array} Array of arrays. Every array row contains following fields: relationship_type_id, custom_field_id, custom_field_label, custom_field_data_type, display_order.
  */
  this.getVisibleCustomFieldsConfigForRelationshipTypeId = function(relationshipTypeId) {
    var result = [];
    cj.each(this.extensionData.visibleCustomFieldsConfig, function(index, customFieldConfig) {
      if(customFieldConfig.relationship_type_id == relationshipTypeId) {
        result.push(customFieldConfig);
      }
    });
    return result;
  };
  
  /**
  * Gets all custom field values for relationship type id.
  *
  * @param {string} relationshipTypeId Relationship type id.
  * @return {array} Object where property name is relationship id in form 'relationshipId_XX'. 
  * Property value is object with 'relationship_id' key and all custom field values with property of custom field id.
  */
  this.getCustomFieldValuesForRelationshipTypeId = function(relationshipTypeId) {
    return this.extensionData.customFieldValues['relationshipTypeId_'+relationshipTypeId];
  };
  
  /**
  * Gets all visible table row Relationship id.
  *
  * @return {array} Array of relationship ids currently visible.
  */
  this.getTableRowsRelationshipIds = function() {
    var result = [];
    cj.each(cj('.dataTables_wrapper tbody tr'), function(index, relationshipRow) {
      var relationshipId = cj(relationshipRow).attr('id').substring('rel_'.length);
      result.push(relationshipId);
    });
    
    return result;
  };
  
  /**
  * Group relationship ids for relationship types.
  *
  * @param {array} relationshipIds Relationship ids.
  * @return {array} Object where property name is relationship type id and value is array of relationship ids.
  */
  this.groupRelationshipIdsByRelationshipType = function(relationshipIds) {
    var relationshipTypeForRelationshipId = this.extensionData.relationshipTypeForRelationshipId;
    var result = {};
    
    cj.each(relationshipIds, function(index, relationshipId) {
      var relationshipTypeId = relationshipTypeForRelationshipId[relationshipId];
      
      if(result.hasOwnProperty(relationshipTypeId) === false) {
        result[relationshipTypeId] = [];
      }
      
      result[relationshipTypeId].push(relationshipId);
    });
    return result;
  };
  
  /**
  * Creates new datatable for every Relationship type and moves rows from old tables to these new tables.
  *
  * @param {object} relationshipIdsForRelationshipType Object where property name is Relationship type id and property value is array of Relationship ids.
  */
  this.buildNewDatatablesForRelationshipTypes = function(relationshipIdsForRelationshipType) {
    var util = this;
    cj.each(this.extensionData['relationshipTypeIds'], function(index, relationshipTypeId) {
      var relationshipIds = relationshipIdsForRelationshipType[relationshipTypeId];
      var html = util.buildNewDatatable(relationshipIds, relationshipTypeId)
      util.insertDatatable(html, relationshipTypeId);
    });
  };
  
  /**
  * Create new datatable HTML for Relationship type.
  *
  * @param {array} relationshipIds Relationship ids of table rows.
  * @param {string} relationshipTypeId Relationship type id of new table.
  * @return {string} Table HTML.
  */
  this.buildNewDatatable = function(relationshipIds, relationshipTypeId) {
    var html = '<table id="datatable_relationshipTypeId_' + relationshipTypeId + '" class="display">';
    html += this.createDatatableHeader(relationshipTypeId);
    html += this.createDatatableRows(relationshipIds, relationshipTypeId);
    html += '</table>';
    return html;
  };
  
  /**
  * Create datatable header row HTML.
  *
  * @param {string} relationshipTypeId Relationship type id of new table.
  * @return {string} Table header HTML.
  */
  this.createDatatableHeader = function(relationshipTypeId) {
    var defaultHeaderName = this.getDatatableDefaultHeaderNames();
    var html = '<thead>';
    
    //Add defaul columns
    html += '<th>' + defaultHeaderName.relationshipColumn + '</th>';
    html += '<th></th>'; //Contact name
    html += '<th>' + defaultHeaderName.startColumn + '</th>';
    html += '<th>' + defaultHeaderName.endColumn + '</th>';
    
    //Add custom data columns
    var customFieldConfigs = this.getVisibleCustomFieldsConfigForRelationshipTypeId(relationshipTypeId);
    cj.each(customFieldConfigs, function(index, customFieldConfig) {
      html += '<th>' + customFieldConfig.custom_field_label + '</th>';
    });
    
    //Add edit links column
    html += '<th class="sorting_disabled" rowspan="1" colspan="1"></th>';
    
    html += '</thead>';
    return html;
  };
  
  /**
  * Create new datatable rows HTML.
  *
  * @param {array} relationshipIds Relationship ids of table rows.
  * @param {string} relationshipTypeId Relationship type id of new table.
  * @return {string} Table rows HTML.
  */
  this.createDatatableRows = function(relationshipIds, relationshipTypeId) {
    var customValuesForRelationshipType = this.getCustomFieldValuesForRelationshipTypeId(relationshipTypeId);
    var util = this;
    var html = '<tbody>';
    
    cj.each(relationshipIds, function(index, relationshipId) {
      html += '<tr class="row-relationship">';
    
      //Add defaul columns
      html += '<td class="bold">' + util.getRelationshipRowRelationshipNameLink(relationshipId) + '</td>';
      html += '<td>' + util.getRelationshipRowContactNameLink(relationshipId) + '</td>';
      html += '<td>' + util.getRelationshipRowStartDate(relationshipId) + '</td>';
      html += '<td>' + util.getRelationshipRowEndDate(relationshipId) + '</td>';
      
      //Add custom data columns
      var customFieldConfigs = util.getVisibleCustomFieldsConfigForRelationshipTypeId(relationshipTypeId);
      var customValuesForRelationshipType = util.getCustomFieldValuesForRelationshipTypeId(relationshipTypeId);
      cj.each(customFieldConfigs, function(index, customFieldConfig) {
        html += '<td>' + util.getCustomFieldValue(customValuesForRelationshipType, relationshipId, customFieldConfig) + '</td>';
      });
      
      //Add edit links column
      html += '<td class="nowrap">' + util.getRelationshipRowEditLinks(relationshipId) + '</td>';
    
      html += '</tr>';
    });
    
    html += '</tbody>';
    return html;
  };
  
  /**
  * Returns Relationship custom field value.
  *
  * @param {object} customValuesForRelationshipType Object of Relationship Custom field values.
  * @param {string} relationshipId Relationship id of table row.
  * @param {object} customFieldConfig Relationship Custom field config.
  * @return {string} Custom field value.
  */
  this.getCustomFieldValue = function(customValuesForRelationshipType, relationshipId, customFieldConfig) {
    if(customValuesForRelationshipType == null) {
      return '';
    }
    
    var relationshipKey = 'relationshipId_'+relationshipId;
    if(customValuesForRelationshipType.hasOwnProperty(relationshipKey) === false) {
      return '';
    }
    
    var relationshipCustomValues = customValuesForRelationshipType[relationshipKey];
    var value = relationshipCustomValues['customFieldId_'+customFieldConfig.custom_field_id];
    
    if(customFieldConfig.custom_field_data_type == 'Boolean') {
      value = value == '1' ? 'True' : 'False';
    }
    
    return value;
  };
  
  /**
  * Inserts new datatable HTML to DOM.
  *
  * @param {string} tableHtml Table HTML.
  * @param {string} relationshipTypeId Relationship type id of new table.
  */
  this.insertDatatable = function(tableHtml, relationshipTypeId) {
    var html = '<div>';
    html += '<h3>' + this.extensionData['relationshipTypeNameForId'][relationshipTypeId] + '</h3>';
    html += '<div class="dataTables_wrapper">';
    html += tableHtml;
    html += '</div>';
    html += '</div>';
    
    cj('#current-relationships').parent().append('<div class="spacer"></div>').append(html);
    cj('#datatable_relationshipTypeId_' + relationshipTypeId).dataTable({
        "bPaginate": false,
        "bFilter": false,
        "bInfo": false
    });
  };
  
  /**
  * Get Relationship name view link from original datatable.
  *
  * @param {string} relationshipId Relationship id of table row.
  * @return {string} Link HTML.
  */
  this.getRelationshipRowRelationshipNameLink = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:first-child').html();
  };
  
  /**
  * Get Contact name edit viewlink from original datatable.
  *
  * @param {string} relationshipId Relationship id of table row.
  * @return {string} Link HTML.
  */
  this.getRelationshipRowContactNameLink = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(2)').html();
  };
  
  /**
  * Get Relationship start date from original datatable.
  *
  * @param {string} relationshipId Relationship id of table row.
  * @return {string} HTML.
  */
  this.getRelationshipRowStartDate = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(3)').html();
  };
  
  /**
  * Get Relationship end date from original datatable.
  *
  * @param {string} relationshipId Relationship id of table row.
  * @return {string} HTML.
  */
  this.getRelationshipRowEndDate = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(4)').html();
  };
  
  /**
  * Get Relationship view, edit, disable and delete link HTML from original datatable.
  *
  * @param {string} relationshipId Relationship id of table row.
  * @return {string} Links HTML.
  */
  this.getRelationshipRowEditLinks = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(9)').html();
  };
  
  /**
  * Get table header column names from original datatable.
  *
  * @return {object} Object with following properties: relationshipColumn, startColumn, endColumn.
  */
  this.getDatatableDefaultHeaderNames = function() {
    var headerRow = cj('.dataTables_wrapper').first().find('thead tr');
    var result = {
      relationshipColumn: headerRow.find('th:nth-child(1)').text(),
      startColumn: headerRow.find('th:nth-child(3)').text(),
      endColumn: headerRow.find('th:nth-child(4)').text()
    };
    return result;
  };
}