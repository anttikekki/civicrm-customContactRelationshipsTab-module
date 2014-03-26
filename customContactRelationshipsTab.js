if(document.URL.indexOf('civicrm/contact/view/rel') !== -1) {
  cj(function ($) {
    var util = new CustomContactRelationshipsTabUtil();
    util.hideOriginalDatatables();
    util.loadExtensionData();
  });
}
else if(document.URL.indexOf('civicrm/contact/view') !== -1) {
  cj(document).ajaxComplete(function( event, xhr, settings ) {
    if(settings.url.indexOf('civicrm/contact/view/rel') !== -1) {
      var util = new CustomContactRelationshipsTabUtil();
      util.relationshipTabIsLoaded();
    }
  });
}

function CustomContactRelationshipsTabUtil() {

  this.extensionData = null;
  
  /**
  * Get parameter value from given URL?
  *
  * @param {string} parm Parameter that is searched from url.
  * @return {string} Parameter value. Null if value is not found.
  */
  this.getParameterFromURL = function(parm) {
    //Code from http://stackoverflow.com/a/10625052
    var re = new RegExp("[?&]" + parm + "=([^&]+)(&|$)");
    var match = document.URL.replace(/&amp;/g, '&').match(re);
    return(match ? match[1] : null);
  }

  this.start = function() {
    var relationshipIds = this.getTableRowsRelationshipIds();
    var relationshipIdsForRelationshipType = this.groupRelationshipIdsByRelationshipType(relationshipIds);
    this.buildNewDatatablesForRelationshipTypes(relationshipIdsForRelationshipType);
    
    //Move info label to bottom
    cj('#current-relationships').parent().append(cj('#permission-legend'));
    cj('#permission-legend').show();
  };
  
  this.loadExtensionData = function() {
    var util = this;
    var contactId = this.getParameterFromURL('cid');
    cj.get( "index.php?q=civicrm/ajax/customContactRelationshipsTabAjaxPage&contactId="+contactId, function( data ) {
      util.extensionData = JSON.parse(data);
      util.start();
    });
  };
  
  this.relationshipTabIsLoaded = function() {
    var util = this;
    setTimeout(function() {
      util.hideOriginalDatatables();
      util.loadExtensionData();
    }, 1);
  };
  
  this.hideOriginalDatatables = function() {
    cj('#current-relationships, #inactive-relationships').hide();
    cj('#permission-legend').hide();
  };
  
  this.getVisibleCustomFieldsConfigForRelationshipTypeId = function(relationshipTypeId) {
    var result = [];
    cj.each(this.extensionData.visibleCustomFieldsConfig, function(index, customFieldConfig) {
      if(customFieldConfig.relationship_type_id == relationshipTypeId) {
        result.push(customFieldConfig);
      }
    });
    return result;
  };
  
  this.getCustomFieldValuesForRelationshipTypeId = function(relationshipTypeId) {
    return this.extensionData.customFieldValues['relationshipTypeId_'+relationshipTypeId];
  };
  
  this.getTableRowsRelationshipIds = function() {
    var result = [];
    cj.each(cj('.dataTables_wrapper tbody tr'), function(index, relationshipRow) {
      var relationshipId = cj(relationshipRow).attr('id').substring('rel_'.length);
      result.push(relationshipId);
    });
    
    return result;
  };
  
  this.groupRelationshipIdsByRelationshipType = function(relationshipIds) {
    var relationshipTypeForRelationshipId = this.extensionData.relationshipTypeForRelationshipId;
    var result = {};
    var relationshipTypeIds = [];
    
    cj.each(relationshipIds, function(index, relationshipId) {
      var relationshipTypeId = relationshipTypeForRelationshipId[relationshipId];
      
      if(result.hasOwnProperty(relationshipTypeId) === false) {
        result[relationshipTypeId] = [];
      }
      
      result[relationshipTypeId].push(relationshipId);
      
      if(relationshipTypeIds.indexOf(relationshipTypeId) === -1) {
        relationshipTypeIds.push(relationshipTypeId);
      }
    });
    
    result.relationshipTypeIds = relationshipTypeIds;
    return result;
  };
  
  this.buildNewDatatablesForRelationshipTypes = function(relationshipIdsForRelationshipType) {
    var util = this;
    cj.each(relationshipIdsForRelationshipType.relationshipTypeIds, function(index, relationshipTypeId) {
      var relationshipIds = relationshipIdsForRelationshipType[relationshipTypeId];
      var html = util.buildNewDatatable(relationshipIds, relationshipTypeId)
      util.insertDatatable(html, relationshipTypeId);
    });
  };
  
  this.buildNewDatatable = function(relationshipIds, relationshipTypeId) {
    var html = '<table id="datatable_relationshipTypeId_' + relationshipTypeId + '" class="display">';
    html += this.createDatatableHeader(relationshipTypeId);
    html += this.createDatatableRows(relationshipIds, relationshipTypeId);
    html += '</table>';
    return html;
  };
  
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
  
  this.getCustomFieldValue = function(customValuesForRelationshipType, relationshipId, customFieldConfig) {
    if(customValuesForRelationshipType == null) {
      return '';
    }
    
    var relationshipKey = 'relationshipId_'+relationshipId;
    if(customValuesForRelationshipType.hasOwnProperty(relationshipKey) === false) {
      return '';
    }
    
    var relationshipCustomValues = customValuesForRelationshipType[relationshipKey];
    var value = relationshipCustomValues[customFieldConfig.custom_field_id];
    
    if(customFieldConfig.custom_field_data_type == 'Boolean') {
      value = value == '1' ? 'True' : 'False';
    }
    
    return value;
  };
  
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
  
  this.getRelationshipRowRelationshipNameLink = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:first-child').html();
  };
  
  this.getRelationshipRowContactNameLink = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(2)').html();
  };
  
  this.getRelationshipRowStartDate = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(3)').html();
  };
  
  this.getRelationshipRowEndDate = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(4)').html();
  };
  
  this.getRelationshipRowEditLinks = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(9)').html();
  };
  
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