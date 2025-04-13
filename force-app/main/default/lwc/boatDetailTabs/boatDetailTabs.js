import { LightningElement, wire, track, api } from 'lwc';
import { NavigationMixin } from 'lightning/navigation';
import BOATMC from '@salesforce/messageChannel/BoatMessageChannel__c';
import { subscribe,unsubscribe,APPLICATION_SCOPE,MessageContext } from 'lightning/messageService';
import { getRecord, getFieldValue } from 'lightning/uiRecordApi';
import labelPleaseSelectABoat from '@salesforce/label/c.Please_select_a_boat'; 
import labelDetails from '@salesforce/label/c.Details';
import labelReviews from '@salesforce/label/c.Reviews';
import labelAddReview from '@salesforce/label/c.Add_Review';
import labelFullDetails from '@salesforce/label/c.Full_Details';

import BOAT_OBJECT from '@salesforce/schema/Boat__c';
import BOAT_ID_FIELD from '@salesforce/schema/Boat__c.Id';
import BOAT_NAME_FIELD from '@salesforce/schema/Boat__c.Name';


// Custom Labels Imports
// import labelDetails for Details
// import labelReviews for Reviews
// import labelAddReview for Add_Review
// import labelFullDetails for Full_Details
// import labelPleas eSelectABoat for Please_select_a_boat
// Boat__c Schema Imports
// import BOAT_ID_FIELD for the Boat Id
// import BOAT_NAME_FIELD for the boat Name
const BOAT_FIELDS = [BOAT_ID_FIELD, BOAT_NAME_FIELD];
export default class BoatDetailTabs extends NavigationMixin(LightningElement) {
  @track boatId;

  @wire(getRecord, {recordId: "$boatId", fields: BOAT_FIELDS})
  wiredRecord;

  @wire(MessageContext)
  messageContext;


  @api label = {
    labelDetails,
    labelReviews,
    labelAddReview,
    labelFullDetails,
    labelPleaseSelectABoat,
  };
  
  // Decide when to show or hide the icon
  // returns 'utility:anchor' or null
  get detailsTabIconName() { 
    if (this.wiredRecord.data) {
        return 'utility:anchor';
    }
    return null;
      
  }
  
  // Utilize getFieldValue to extract the boat name from the record wire
  get boatName() { 
    return getFieldValue(this.wiredRecord.data, BOAT_NAME_FIELD);
  }
  
  // Private
  subscription = null;
  
  // Subscribe to the message channel
  subscribeMC() {
    // local boatId must receive the recordId from the message
    this.subscription = subscribe(
        this.messageContext,
        BOATMC,
        (message) =>this.boatId = message.recordId,
        {scope: APPLICATION_SCOPE}
    );
  }
  
  // Calls subscribeMC()
  connectedCallback() {
    if(this.subscription){
        return;
    }
    this.subscribeMC();
   }
  
  // Navigates to record page
  navigateToRecordViewPage(event) { 
    event.preventDefault();
    event.stopPropagation();
    this[NavigationMixin.Navigate]({
        type: 'standard__recordPage',
        attributes: {
            recordId: this.boatId,
            objectApiName: BOAT_OBJECT,
            actionName: 'view'
        }
    });

  }
  
  // Navigates back to the review list, and refreshes reviews component
  handleReviewCreated() { 
    this.template.querySelector('lightning-tabset').activeTabValue = 'reviews';
    this.template.querySelector('c-boat-reviews').refresh();
  }
}
