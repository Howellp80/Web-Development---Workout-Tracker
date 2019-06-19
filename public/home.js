 
// handles onclick event for Add Exercise button
document.getElementById("addExerButton").addEventListener('click', function(event) {
 	var name = document.getElementById("exerName").value;
 	if (name != ""){
 		
 		var useLbs = document.getElementById("lbsRad").checked;

 		// get info from text fields
      var newExerData = {};
      newExerData.name = name;
      newExerData.reps = document.getElementById("exerReps").value;
      newExerData.weight = document.getElementById("exerWeight").value;
      newExerData.date = document.getElementById("exerDate").value;
      //console.log(newExerData.date);
      newExerData.lbs = useLbs;
		//console.log(newExerData);

		var req = new XMLHttpRequest();
      req.open('POST', '/addExer', true);
      req.setRequestHeader('Content-Type', 'application/json');
		req.addEventListener('load', function() {
			if (req.status >= 200 && req.status < 400) {
	         var response = JSON.parse(req.responseText);
	         //console.log(response);
	         var hasObjects = response.length;
	         //console.log(hasObjects);

	         //  call to rebuild the table body after adding a new row
				if (hasObjects) {
	         	var tT = document.getElementById("theTable");
					tT.replaceChild(makeTBody(response), tT.childNodes[2]);
	         }
	      } 
	      else {
	          console.log("Err: " + req.statusText);
			}
		});
		req.send(JSON.stringify(newExerData));
 		event.preventDefault();
 	}
 	event.preventDefault();
});



// builds the original table body with data already in database
// first we need to fetch the current data...
var req = new XMLHttpRequest();
req.open('GET', '/fetch', true);
req.setRequestHeader('Content-Type', 'application/json');
req.addEventListener('load', function() {
   if (req.status >= 200 && req.status < 400) {
	   var response = JSON.parse(req.responseText);
	   //console.log("response from fetch:");
	   //console.log(response);
	   var hasObjects = response.length;
	   //console.log(hasObjects);

	   // call to build the table body
		if (hasObjects) {
	      var tT = document.getElementById("theTable");
			tT.replaceChild(makeTBody(response), tT.childNodes[2]);
	   }
   } 
   else {
      console.log("Err: " + req.statusText);
   }
});
req.send(null); 


// this actually builds/rebuilds the tbody...
function makeTBody(response) {
	//console.log("In makeTBody");
   var newTB = document.createElement("tbody");
   newTB.id = "theTB";
   //newTB.textContent = "table body";
   //var size = Object.keys(response).length
   //console.log("response size: " + size);
	
	for (var compExer in response){
		//console.log("compExer = " + compExer);

		var newRow = document.createElement("tr");

		// make the hidden id input
		var inputID = document.createElement("input");
		inputID.type = "hidden";
		inputID.id = response[compExer].id;
		//console.log(inputID.id);
		newRow.appendChild(inputID);

		// make the name td
		var tdName = document.createElement("td");
		tdName.textContent = response[compExer].name;
		newRow.appendChild(tdName);

		// make the reps td
		var tdReps = document.createElement("td");
		tdReps.textContent = response[compExer].reps;
		newRow.appendChild(tdReps);

		// make the weight td
		var tdWeight = document.createElement("td");
		tdWeight.textContent = response[compExer].weight;
		newRow.appendChild(tdWeight);

		// make the lbs/kg td
		var tdLbs = document.createElement("td");
		var usedLbs = response[compExer].lbs;
		if (usedLbs)
			tdLbs.textContent = "lbs";
		else
			tdLbs.textContent = "kg";
		newRow.appendChild(tdLbs);		

		// make the date td
		var tdDate = document.createElement("td");
		tdDate.textContent = response[compExer].date.slice(0,10);
		newRow.appendChild(tdDate);

		// form for edit and delete buttons
		var newForm = document.createElement("form");
		
		// make the edit button
		var editButton = document.createElement("button");
      editButton.textContent = "Edit";
      var compExerID = response[compExer].id;
      editButton.onclick = function(x){
      	return function(){
	         //console.log("exercise id: " + x);
	         location.href = "/edit?id=" + x;
				event.preventDefault();
			};
      }(compExerID);

      		

		// make the delete button
		var deleteButton = document.createElement("button");
		deleteButton.textContent = "Delete";

		deleteButton.onclick = function(x) {
			return function(event){
			   var deleteObj = {};
			   deleteObj.id = x;
			   
				var req = new XMLHttpRequest();
			   req.open('POST', '/delete', true);
			   req.setRequestHeader('Content-Type', 'application/json');
			   req.addEventListener('load', function() {
			   	// if row removed from DB, delete the tbody row
			      if (req.status >= 200 && req.status < 400) {
			         
			         location.href = "/";
			         //var theT = document.getElementById("theTable");
			         //var theTableBody = document.getElementById("theTB");
			         //console.log("In the DOM at: ");
			         //console.log(theTableBody);
			         //var curRow = deleteButton.parentNode.parentNode.rowIndex;
			         //console.log(curRow);
			         //theT.deleteRow(curRow); 
			      } 
			      else {
			           console.log("Err: " + req.statusText);
			      }
			   });
			   req.send(JSON.stringify(deleteObj)); 
			   event.preventDefault();
			};
		}(compExerID);

 		// add the edit and delete buttons to form, and form to row, and row to tbody
 		newForm.appendChild(editButton);
		newForm.appendChild(deleteButton);
		newRow.appendChild(newForm);
		newTB.appendChild(newRow);
	}
   return newTB;
}