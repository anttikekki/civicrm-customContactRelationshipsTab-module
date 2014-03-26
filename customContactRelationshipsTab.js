cj(document).ajaxComplete(function( event, xhr, settings ) {
  if(settings.url.indexOf('civicrm/contact/view/rel') !== -1) {
    var util = new CustomContactRelationshipsTabUtil();
    util.relationshipTabIsLoaded();
  }
});

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
  };
  
  this.loadExtensionData = function() {
    var util = this;
    var contactId = this.getParameterFromURL('cid');
    cj.get( "index.php?q=civicrm/ajax/customContactRelationshipsTabAjaxPage&contactId="+contactId, function( data ) {
      console.log(data);
      util.extensionData = JSON.parse(data);
      util.start();
    });
  };
  
  this.relationshipTabIsLoaded = function() {
    var util = this;
    setTimeout(function() {
      util.loadExtensionData();
    }, 1);
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
    cj.each(cj('.row-relationship'), function(index, relationshipRow) {
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
      relationshipTypeIds.push(relationshipTypeId);
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
    var html = '<table class="display">';
    html += this.createDatatableHeader(relationshipTypeId);
    html += this.createDatatableRows(relationshipIds, relationshipTypeId);
    html += '</table>';
    return html;
  };
  
  this.createDatatableHeader = function(relationshipTypeId) {
    var defaultHeaderName = this.getDatatableDefaultHeaderNames();
    var html = '<thead>';
    
    //Add defaul columns
    html += '<th class="sorting" rowspan="1" colspan="1">' + defaultHeaderName.relationshipColumn + '</th>';
    html += '<th class="sorting_disabled" rowspan="1" colspan="1"></th>'; //Contact name
    html += '<th class="sorting" rowspan="1" colspan="1">' + defaultHeaderName.startColumn + '</th>';
    html += '<th class="sorting" rowspan="1" colspan="1">' + defaultHeaderName.endColumn + '</th>';
    
    //Add custom data columns
    var customFieldConfigs = this.getVisibleCustomFieldsConfigForRelationshipTypeId(relationshipTypeId);
    cj.each(customFieldConfigs, function(index, customFieldConfig) {
      html += '<th class="sorting" rowspan="1" colspan="1">' + customFieldConfig.custom_field_label + '</th>';
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
      var customValues = util.getCustomFieldValuesForRelationshipTypeId(relationshipTypeId);
      cj.each(customFieldConfigs, function(index, customFieldConfig) {
        html += '<td>' + customValues['relationshipId_'+relationshipId][customFieldConfig.custom_field_id] + '</td>';
      });
      
      //Add edit links column
      html += '<td class="nowrap">' + util.getRelationshipRowEditLinks(relationshipId) + '</td>';
    
      html += '</tr>';
    });
    
    html += '</tbody>';
    return html;
  };
  
  this.insertDatatable = function(tableHtml, relationshipTypeId) {
    var html = '<div>';
    html += '<h3>Otsikko</h3>';
    html += '<div class="dataTables_wrapper">';
    html += tableHtml;
    html += '</div>';
    html += '</div>';
    
    cj('#Relationships .crm-block').append(html);
  };
  
  this.getRelationshipRowRelationshipNameLink = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:first-child').html();
  };
  
  this.getRelationshipRowContactNameLink = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('td:nth-child(2)').html();
  };
  
  this.getRelationshipRowStartDate = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('.crm-rel-start_date').html();
  };
  
  this.getRelationshipRowEndDate = function(relationshipId) {
    return cj('#rel_' + relationshipId).find('.crm-rel-end_date').html();
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