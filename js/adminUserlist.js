/*
		THIS PART OF THE SCRIPT IS TO FIND ALL USERS
		IT CONTAINS THE FETCH FROM DATABASE, FILLING THE TABLE AND
		THE PAGINATION FUNCTIONS
*/

// Find reserved users and fill table
function FetchUsers()
{
    fetch(backendurl + "/employee").then(response => {
        return response.json();
    }).then( users => {
        window.localStorage.setItem("userData", JSON.stringify(users));
        FillTableUsers(0, users);
    })
}

// Fill table with reserved users
function FillTableUsers(tablePage, data)
{
    let usersInTable = 4;
	
    let userTableHtml =
        `
		<thead>
			<tr>
                <th>ID</th>
                <th>Naam</th>
				<th>Email</th>
                <th>Boeken in bezit</th>
                <th>Is Admin</th>
                <th>Profielfoto</th>
                <th>Update</th>
                <th>Verwijder</th>
             </tr>
		</thead>
		<tbody>`;
		
		let userCount = 0;
		let userThresh = usersInTable * tablePage; 

    // Loop to access all rows 
    for (let user of data)
	{
		if (userCount >= userThresh && userCount < userThresh + usersInTable)
		{
			let employee = JSON.stringify(user)
			userTableHtml += `<tr>
           	    <td>${user.employeeId}</td>
                <td>${user.employeeName}</td>
                <td>${user.employeeEmail}</td>
                <td>${user.employeeCurrentlyLoaned}</td>
                <td>${user.employeeAdmin}</td>
                <td><img src="${user.employeeAvatar}" width="75" height="75" alt="Profielfoto ${user.employeeName}"></td>
                <td><button type="button" onclick='UpdateEmployeePopup(${employee})'>Update</button></td>
                <td><button type="button" onclick='DeleteEmployee(${employee})'>Verwijder</button></td>
            </tr>`;
		}

		userCount++;
    }

	userTableHtml += `</tbody>`
	
    let userThreshMax = data.length < userThresh + usersInTable ? data.length : userThresh + usersInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("adminEmployeeTable").innerHTML = userTableHtml;
    document.getElementById("items-wrapper-admin-employees").innerHTML = `Showing ${userThresh + 1} to ${userThreshMax} of ${data.length} users`;

    createTablePaginationEmployees(tablePage, usersInTable, data);
}

function createTablePaginationEmployees(tablePage, itemsInTable, data)
{
    let pagesNeeded = parseInt(data.length / itemsInTable);
    if (data.length % itemsInTable != 0)
        pagesNeeded += 1;

    // Calculate the mininum label number of the table. parseInt casts
    // the division to an int: 4.0 until 4.9 = 4 for example.
    let amountOfLabels = 5;
    let minLabelNum = Math.max(0, parseInt(tablePage / amountOfLabels) * amountOfLabels); 
    let prevButton = tablePage - 1;
    let labelThresh = 5 + tablePage;
       
    // Cap the previous button to page 0 (indexing starts at 0).
    if (prevButton < 0)
        prevButton = 0;
    let paginationHTML = `<label for="table_radio_3" onclick='FillTableUsers(${prevButton}, ${JSON.stringify(data)})'>&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick='FillTableUsers(${labelCount}, ${JSON.stringify(data)})'>${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick='FillTableUsers(${nextButton}, ${JSON.stringify(data)})'>Next &raquo;</label>`;
    
    document.getElementById("pagination-users").innerHTML = paginationHTML;
}

FetchUsers();


	/*

		THIS PART OF THE SCRIPT IS TO CREATE A USER
		IT OPENS A POPUP TO ALLOW THE ADMIN TO
		SET ALL THE CORRECT USER INFORMATION

	*/
	
// Create new employee
function NewEmployeePopup()
{
	let formHtml = `
                <form class="">
                    <h1>Nieuwe Medewerker</h1>
                    <label for="Naam"><b>Naam</b></label>
                    <input id="newName" class="employee-input" type="text" placeholder="Jan Piet" name="name">

                    <label  for="Email"><b>Email</b></label>
                    <input id="newEmail" class="employee-input" type="text" placeholder="jp@wt.nl" name="email">

                    <label for="Wachtwoord"><b>Wachtwoord</b></label>
                    <input id="newPassword" class="employee-input" type="text" placeholder="Wachtwoord123" name="password">
                    
                    <label for="Administrator"><b>Administrator</b></label>
                    <input id="newAdmin" class="employee-input" type="checkbox" onclick="ToggleAdmin()">

                    <label for="Profielfoto"><b>Profielfoto</b></label>
                    <input id="newAvatar" class="employee-input" type="text" placeholder="wt.nl/profielfoto.jpg" name="avatar">
                </form>
                <button id="submitNewEmployee" type="button" onclick='CreateEmployee("change-employee-form")'>Maak aan</button>
                <button id="closeNewEmployee" type="button" onclick='CloseEmployeePopup()'>Sluiten</button>`;
    
	document.getElementById("change-employee-form").innerHTML = formHtml;
    document.getElementById("change-employee-form").style.display = "flex";
}

// Create new unique book (if it doesn't already exist)
async function CreateEmployee(divTohideId)
{
    // Formulier uitlezen
    let nameInput = document.getElementById('newName').value;
    let emailInput = document.getElementById('newEmail').value;
    let passwordInput = document.getElementById('newPassword').value;
    let adminInput = document.getElementById('newAdmin').checked;
    let avatarInput = document.getElementById('newAvatar').value;

	console.log(adminInput);

    let newEmployee = {
        employeeName: nameInput,
        employeeEmail: emailInput,
		employeePassword: passwordInput,
        employeeAdmin: adminInput,
        employeeAvatar: avatarInput
    }

    let response = await fetch(backendurl + "/employee/new/", {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(newEmployee)
    })
    .catch(error => {
        alert('Er is iets fouts gegaan');
    });

	let str = await response.json();
	alert(str.response);
	FetchUsers();
    document.getElementById(divTohideId).style.display = "none";
}


	/*

		THIS PART OF THE SCRIPT IS TO UPDATE A USER
		IT OPENS A POPUP, SETS THE INFORMATION AND
		ALLOWS THE ADMIN TO CHANGE INFORMATION

	*/

async function UpdateUser(employeeId, employee)
{
	let response = await fetch(backendurl + "/employee/" + employeeId + "/update", {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.then(response => {
		alert('Is goedgegaan');
		CloseSelectCopyPopup();
	})
	.catch(error => {
		alert('Er is iets fouts gegaan');
		CloseSelectCopyPopup();
	});
	
	let str = await response.json();
	alert(str.response);
	FetchUsers();
}
	
// Close popup
function CloseEmployeePopup()
{
	document.getElementById("change-employee-form").style.display = "none";
}

// Update existing employee
function UpdateEmployeePopup(employee)
{
	let changeEmployeeNameId = "changeNameId";
    let changeEmployeeEmailId = "changeEmailId";
    let changeEmployeeAdminId = "changeAdminId";
    let changeEmployeeAvatarId = "changeAvatarId";

    let formHtml = `
                <form class="">
                    <h1>${employee.employeeName} aanpassen</h1>
					<p>${employee.employeeId}</p>
                    <label for="Naam"><b>Naam</b></label>
                    <input id="${changeEmployeeNameId}" class="employee-input" type="text" placeholder="Jan Piet" name="name">

                    <label  for="Email"><b>Email</b></label>
                    <input id="${changeEmployeeEmailId}" class="employee-input" type="text" placeholder="jp@wt.nl" name="email">
                    
                    <label for="Administrator"><b>Administrator</b></label>
                    <input id="${changeEmployeeAdminId}" class="employee-input" type="checkbox">

                    <label for="Profielfoto"><b>Profielfoto</b></label>
                    <input id="${changeEmployeeAvatarId}" class="employee-input" type="text" placeholder="wt.nl/profielfoto.jpg" name="avatar">
                </form>
                <button id="submitUpdateEmployee" type="button" onclick='SubmitUpdateUser(${employee.employeeId}, ${changeEmployeeNameId}, ${changeEmployeeEmailId}, ${changeEmployeeAdminId}, ${changeEmployeeAvatarId}, "change-employee-form")'>Pas aan</button>
                <button id="closeUpdateEmployee" type="button" onclick='CloseEmployeePopup()'>Sluiten</button>`;
    
	document.getElementById("change-employee-form").innerHTML = formHtml;
    document.getElementById("change-employee-form").style.display = "flex";

    document.getElementById(changeEmployeeNameId).value = employee.employeeName;
    document.getElementById(changeEmployeeEmailId).value = employee.employeeEmail;
    document.getElementById(changeEmployeeAdminId).checked = employee.employeeAdmin;
    document.getElementById(changeEmployeeAvatarId).value = employee.employeeAvatar;
}


async function SubmitUpdateUser(employeeId, employeeName, employeeEmail, employeeAdmin, employeeAvatar, divTohideId)
{
    console.log( "update submit " + employeeId + " " + (employeeName));
    // Formulier uitlezen
    let nameInput = employeeName.value;
    let emailInput = employeeEmail.value;
    let adminInput = employeeAdmin.checked;
    let avatarInput = employeeAvatar.value;

    if (employeeId != null)
    {
        // Maak ik een person object in javascript
        let updateEmployee = {
			employeeName: nameInput,
			employeeEmail: emailInput,
			employeeAdmin: adminInput,
			employeeAvatar: avatarInput
		}

        let response = await fetch(backendurl + "/employee/" + employeeId + "/update", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateEmployee)
        })
        .catch(error => {
            alert('Er is iets fouts gegaan');
        });

		let str = await response.json();
		alert(str.response);
		FetchUsers();
    }
    document.getElementById(divTohideId).style.display = "none";
}


/*

	THIS PART OF THE SCRIPT IS TO UPDATE A USER
	IT OPENS A POPUP, SETS THE INFORMATION AND
	ALLOWS THE ADMIN TO CHANGE INFORMATION

*/

function DeleteEmployee(employee)
{
	let formHtml = `
        <form class="">
        	<h3>${employee.employeeName} verwijderen?</h3>
			<button id="submitDelete" type="button" onclick='SubmitDeleteEmployee(${employee.employeeId}, "delete-book-form")'>Ja</button>
			<button id="" type="button" onclick='CloseEmployeeDeletePopup()'>Nee</button>
        </form>`;

		
	document.getElementById("delete-employee-form").innerHTML = formHtml;
	document.getElementById("delete-employee-form").style.display = "flex";
}

async function SubmitDeleteEmployee(id)
{
	let response = await fetch(backendurl + "/employee/" + id + "/delete", {
        method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		},
    })
    .catch(error => {
        alert('Er is iets fouts gegaan');
    });

	let str = await response.json();
	alert(str.response);
	FetchUsers();
	CloseEmployeeDeletePopup();
}

// Close popup
function CloseEmployeeDeletePopup()
{
	document.getElementById("delete-employee-form").style.display = "none";
}


/*

	THIS PART OF THE SCRIPT IS TO SEARCH
	A USER BASED ON THE USER NAME ONLY

*/

function SearchEmployee()
{
	let input = document.getElementById("searchEmployee").value.toLowerCase();
    let data = JSON.parse(window.localStorage.userData);

	let foundData=[];

	for (let user of data)
	{
		if (user.employeeName.toLowerCase().includes(input))
		{
			foundData.push(user);
		}
	}

	console.log(foundData);
	FillTableUsers(0, foundData);
}