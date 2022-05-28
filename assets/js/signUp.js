let json_person={
		"resourceType": "Person",
		"active": "true",
		"identifier": [ 
			{
				"system": "UserID",
				"value": "victoriatjiaa@gmail.com"
			}, 
			{
				"system": "Password",
				"value": "MWI0ZjBlOTg1MTk3MTk5OGU3MzIwNzg1NDRjOTZiMzZjM2QwMWNlZGY3Y2FhMzMyMzU5ZDZmMWQ4MzU2NzAxNA=="
			}
		],
		"name": [ {
			"text": "Victoria Tjia"
		} ],
		"telecom": [
			{
			  "system": "email",
			  "value": "victoriatjiaa@gmail.com"
			}
		],
		"gender": "female",
		"birthDate": "1999-12-25"
	}

let json_patient= {
		"resourceType": "Patient",
		"active": "true",
		"name": [ {
			"text": "Victoria Tjia"
		} ],
		"managingOrganization": {
			"reference": "Organization/2137917"
		}
	}
	
let localVar = {
	person:{},
	patient:{}
}

function initLocalVar()
{
	localVar.person= json_person;
	localVar.patient= json_patient;
}

//Function Initialization
$(document).ready(function(){
	$("#loadingPage").show();
	// Clear session
	let stringValue = window.sessionStorage.getItem("globarVar")
    if (stringValue != null) 
	{
		window.sessionStorage.removeItem("globarVar");
	}
	// Get Organization Information
	getResource(FHIRURL, 'Organization', '/' + DB.organization, FHIRResponseType, 'displayOrganizationMessage');
});

// Get FHIR Organization Information
function displayOrganizationMessage(str)
{
	let obj= JSON.parse(str);
	if(retValue(obj))
	{
		globalVar.organization= obj;
		let organizationName= (obj.name) ? obj.name : '';
		let CPName="";
		let CPEmail="";
		let CPPhone="";
		if (obj.contact)
		{
			CPName= obj.contact[0].name.text;
			obj.contact[0].telecom.map((telecom, i) => {
				if (telecom.system == "email")
					CPEmail= telecom.value;
				else if (telecom.system == "phone")
					CPPhone= telecom.value;
			});
		}
		let template= ", please contact " + CPName + "<br>Phone No.：" + CPPhone + "<br>Email：" + CPEmail;
		//Show page body
		$("#loadingPage").hide();
		$("#page-body").show();
		$("#header-brand").html(organizationName);
		$("#contactPerson").html(alertMessageEN.signInFail + template);
	}
}

//Validate data input by user
function validateData(){
	initLocalVar();
	if(formFieldValidation("signUpForm")){
		getResource(FHIRURL, 'Person', '?identifier=' + $("#Email").val(), FHIRResponseType, 'verifyUser');
	}
}

//Verify FHIR Person & Patient exist or not 
function verifyUser(str){ 
	let obj= JSON.parse(str);
	//if person exist -> alert "user exist"
	if (obj.total > 0)
	{			
		alert(alertMessageEN.accountExist);
	}
	//if person unexist -> create new Person ->  create new Patient
	else 
	{
		createPerson();
	}
}


//Create new FHIR Person
function createPerson(){
	//initialize();
	localVar.person.identifier[0].value= $("#Email").val();
	localVar.person.identifier[1].value= $('#SHA256PWD').val();
	localVar.person.name[0].text= $('#Name').val();
	localVar.person.telecom[0].value= $("#Email").val();
	localVar.person.gender= $('input[name="Gender"]:checked').val();
	localVar.person.birthDate= $("#DOB").val();
	let personSTR = JSON.stringify(localVar.person);	
	postResource(FHIRURL, 'Person', '', FHIRResponseType, "createPatient", personSTR);
}

//Create new FHIR Patient
function createPatient(str){
	let obj= JSON.parse(str);
	//If success to create new Person
	if (retValue(obj))
	{
		localVar.person= obj;
		localVar.patient.name[0].text= localVar.person.name[0].text;
		localVar.patient.managingOrganization.reference= 'Organization/' + DB.organization;
		let patientSTR = JSON.stringify(localVar.patient);
		postResource(FHIRURL, 'Patient', '', FHIRResponseType, "updatePerson", patientSTR);
	}
}

//Update FHIR Person to connect it with FHIR Patient
function updatePerson(str){
	let obj= JSON.parse(str);
	if (retValue(obj))
	{
		localVar.patient= obj;
		let link= '{"link":[{"target":{"reference":"Patient/' + localVar.patient.id + '","display": "' + localVar.person.name[0].text + '"}}]}';
		link= JSON.parse(link);
		
		if(localVar.person.link == null)
		{
			localVar.person = {
			  ...localVar.person,
			  ...link,
			};
		}
		let personSTR = JSON.stringify(localVar.person);
		putResource(FHIRURL, 'Person', '/' + localVar.person.id, FHIRResponseType, "signUpResult", personSTR);
	}
}

function signUpResult(str){
	let obj= JSON.parse(str);
	if (retValue(obj))
	{
		alert(alertMessageEN.signUpOK);
		window.close();
	}
}