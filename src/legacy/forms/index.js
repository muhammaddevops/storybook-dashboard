/*
Custom forms implementation for entering user-defined tabulated data (lists)
that can later be joined

The will work as follows:

* When on the metrics settings page, for a specific metric the admin user can opt to “include form” for the metric (much like “enable document upload” works)
* The user is prompted to either select an existing form already in use across their account or to create a new one
* If creating a new form, the form should have:
  * A form name
  * Ability to create column headers
  * Ability to determine column input data type (free text, number or dropdown). Note: we may want to allow short-form postcode or coordinates to integrate this with our mapping functionality?

* Once the form is saved against a metric, users entering data against that metric will see a “complete form” 
  button (similar to “upload evidence”)
* When clicking on “complete form” a pop-up window opens the form. The user can “add rows” of data and “save” 
  their form. Please note: data input should be in the required format otherwise an error message should appear 
  in the cell.
* The form is then listed like an attachment and should be editable until the report is submitted. Once submitted,
  the form is no longer editable but can be viewed by clicking on the form link (similar to the attachment).
* In the corporate dashboard (and other dashboards if possible), there should be an “export forms” button: the user 
  is prompted to select the form they wish to export and the reporting period. Upon export, a file is generated with 
  the header columns and all the rows of input data submitted by reporters underneath that reporting tree. The form 
  should have an additional column with the reporting package name of where the row data was reported.
* Forms should be included in saved templates i.e. if a template includes a form, projects built from that template 
  should also have the form
*/
