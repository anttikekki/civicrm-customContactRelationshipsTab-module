cj(document).ajaxComplete(function( event, xhr, settings ) {
  if(settings.url.indexOf('civicrm/contact/view/rel') !== -1) {
    var util = new CustomContactRelationshipsTabUtil();
    util.relationshipTabIsLoaded();
  }
});

function CustomContactRelationshipsTabUtil() {

  this.start = function() {
    var relationshipIds = this.getTableRowsRelationshipIds();
    var relationshipIdsForRelationshipType = this.groupRelationshipIdsByRelationshipType(relationshipIds);
    
  };
  
  this.relationshipTabIsLoaded = function() {
    var that = this;
    setTimeout(function() {
      that.start()
    }, 1);
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
    var relationshipTypeForRelationshipId = CRM.customContactRelationshipsTab.relationshipTypeForRelationshipId;
    var result = {};
    
    cj.each(relationshipIds, function(index, relationshipId) {
      var relationshipTypeId = relationshipTypeForRelationshipId[relationshipId];
      
      if(result.hasOwnProperty(relationshipTypeId) === false) {
        result[relationshipTypeId] = [];
      }
      
      result[relationshipTypeId].push(relationshipId);
    });
    
    return result;
  }
}