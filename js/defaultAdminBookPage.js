async function fillBookPage() {
    let book = localStorage.getItem("currentBook");
    let wrappedBook = book;
    book = JSON.parse(book);
    let ownedList = [];
    await fetch(backendurl + "/book/findloaned/" + book.bookId).then(response => {
        return response.json();
    }).then(data => {
        for (book_2 of data) {
            if (book.bookIsbn == book_2.bookIsbn) {
                ownedList.push(book_2);
            }
        }
    });
    
    localStorage.setItem("ownedBooks", JSON.stringify(ownedList));

    if (!book) {
        alert("No book found");
        return;
    }

    document.getElementById("bookTitle").innerHTML = book.bookTitle;
    document.getElementById("bookAuthor").innerHTML = book.bookAuthor;
    document.getElementById("bookIsbn").innerHTML = book.bookIsbn;
    document.getElementById("bookCopies").innerHTML = "Hoeveelheid beschikbaar: " + book.bookCopies;
    document.getElementById("bookImg").src = book.bookCover;
    document.getElementById("updateBookButton").onclick = function () { updateBook(wrappedBook) };
    document.getElementById("addCopiesButton").onclick = function () { addCopies(wrappedBook) };
}


function openPage(divId) {
    if (divId == "MijnOverzicht")
        localStorage.setItem("currentTab", 0);
    else if (divId == "Boekenlijst")
        localStorage.setItem("currentTab", 1);
    else
        localStorage.setItem("currentTab", 2); 
    window.location = "../html/adminPage.html";
}

// zien wie exemplaar heeft

function openScreenmask() {
    document.getElementById("screenmask").style.display = "";
}

function hideMenus() {
    document.getElementById("screenmask").style.display = "none";
    
    let changeFormId = "change-book-form";
    document.getElementById(changeFormId).style.display = "none";
    
    document.getElementById("copy-add-form-confirmation").style.display = "none";

}

function refreshBook() {
    let book = localStorage.getItem("currentBook");
    book = JSON.parse(book);
    if (!book) {
        alert("No book found");
        return;
    }
    
    // fetch(`https://workingtalentbieb.azurewebsites.net:8082/book/findsingle/${book.bookId}`, {
    fetch(`http://localhost:8082/book/findsingle/${book.bookId}`, {
        method: 'GET',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
         return response.json();
    }).then( data => {
        book = JSON.stringify(data);
        localStorage.setItem("currentBook", book);
        fillBookPage();
    })
}

function submitUpdateBook(bookId, changeBookTitleId, changeBookAuthorId, changeBookIsbnId, changeBookTagsId, divTohideId) {
    console.log( "update submit "+ bookId + " " + (changeBookTitleId.value));
    // Formulier uitlezen
    let idInput = bookId;
    console.log(document.getElementById(changeBookTitleId));
    let titleInput = changeBookTitleId.value;
    let authorInput = changeBookAuthorId.value;
    let isbnInput = changeBookIsbnId.value;
    let tagsInput = changeBookTagsId.value;
    tagsInput = tagsInput.split(",");

    if (idInput != null)
    {
        // Maak ik een person object in javascript
        let updateBook = {
            bookTitle: titleInput,
            bookAuthor: authorInput,
            bookIsbn: isbnInput,
            bookTags: tagsInput,
        }

        fetch(backendurl + "/book/" + idInput + "/update", {
            method: 'PUT',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(updateBook)
        })
        .then(response => {
            alert("Aanpassen gelukt");
            refreshBook();
        })
        .catch(error => {
            alert('Er is iets fouts gegaan');
        });
    }
    document.getElementById(divTohideId).style.display = "none";
}


// Update existing book
function updateBook(book) {
    let changeBookTitleId = "changeBookTitle";
    let changeBookAuthorId = "changeBookAuthorId";
    let changeBookIsbnId = "changeBookIsbnId";
    let changeBookTagsId = "changeBookTagsId";
    let wrappedBook = book;
    book = JSON.parse(book);

    openScreenmask();

    let formHtml = `
                <form class="">
                    <h1>${book.bookTitle} aanpassen</h1>
                    <label for="Titel"><b>Titel</b></label>
                    <input id="${changeBookTitleId}" class="book-input" type="text" placeholder="The lord of the Rings" name="titel">

                    <label  for="Auteur"><b>Auteur</b></label>
                    <input id="${changeBookAuthorId}" class="book-input" type="text" placeholder="J.R.R. Tolkien" name="auteur">

                    <label for="ISBN"><b>ISBN</b></label>
                    <input id="${changeBookIsbnId}" class="book-input" type="text" placeholder="J.R.R. Tolkien" name="isbn">
                    
                    <label for="Tags"><b>Tags</b></label>
                    <input id="${changeBookTagsId}" class="book-input" type="text" placeholder="J.R.R. Tolkien" name="isbn">
                </form>
                <button id="submitUpdate" type="button" onclick='submitUpdateBook(${book.bookId}, ${changeBookTitleId}, ${changeBookAuthorId}, ${changeBookIsbnId}, ${changeBookTagsId}, "change-book-form")'>Pas aan
`;
    document.getElementById("change-book-form").innerHTML = formHtml;
    document.getElementById("change-book-form").style.display = "flex";
    document.getElementById(changeBookTitleId).value = book.bookTitle;
    document.getElementById(changeBookAuthorId).value = book.bookAuthor;
    document.getElementById(changeBookIsbnId).value = book.bookIsbn;
    document.getElementById(changeBookTagsId).value = book.bookTags;
}

function addCopies(book) {
    openScreenmask();
    let wrappedBook = book;
    book = JSON.parse(book);

    let formHtml = `<form class="">
                        <h1> ${book.bookTitle} exemplaren toevoegen</h1>
            <label for="Hoeveelheid"><b>Hoeveelheid</b></label>
            <input id="copyAmount" class="book-input" type="number" placeholder="10" name="hoeveelheid" required>
                    
                    </form>
                    <button onclick='addCopyPreSubmit(${JSON.stringify(wrappedBook)})' >Bevestig</button>
        `
    document.getElementById("change-book-form").innerHTML = formHtml;
    document.getElementById("change-book-form").style.display = "flex";
}

function addCopyPreSubmit(book) {
    let wrappedBook = JSON.stringify(book);

    let copyAmount = document.getElementById("copyAmount").value
    if (!copyAmount || copyAmount <= 0) {
        alert("Vul een hoeveelheid boven 0 in");
        return;
    }

    let formHtml = `
                    <form>
                        Weet je zeker dat je ${copyAmount} exemplaren wilt toevoegen?
                    </form>
                    <button onclick='addCopySubmit(${wrappedBook}, ${copyAmount})' >Ja</button>
                    <button onclick='closeCopySubmit()' >Nee</button>
        `;
    document.getElementById("change-book-form").style.display = "none";
    document.getElementById("copy-add-form-confirmation").style.display = "flex";
    document.getElementById("copy-add-form-confirmation").innerHTML = formHtml;

}

function closeCopySubmit() {
    document.getElementById("copy-add-form-confirmation").style.display = "none";
    document.getElementById("change-book-form").style.display = "flex";
}

function addCopySubmit(book, copyAmount) {
    book = JSON.parse(book);
    console.log("book " + book.bookId);
    fetch(`http://localhost:8082/book/${book.bookId}/copy/new/${copyAmount}`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
    })
    .then(response => {
        refreshBook();
        alert("Gelukt");
    }).catch(e => {
        alert("Er is iets misgegaan " + e.message);
    });
    hideMenus();
}

// Fill table with reserved books
function FillTableOwned(tablePage) {
    let booksInTable = 8;
    let data = JSON.parse(window.localStorage.ownedBooks);
	
    let bookTableHtml =
        `
		<thead>
			<tr>
				<th>Naam</th>
				<th>Uitleen datum</th>
				<th></th>
             </tr>
		</thead>
		<tbody>`;
		
    let bookCount = 0;
    let bookThresh = booksInTable * tablePage; 

    // Loop to access all rows 
    for (let book of data)
	{
		if (bookCount >= bookThresh && bookCount < bookThresh + booksInTable)
		{
        	let ownedBook = book;
       		bookTableHtml += `<tr>
           	    <td>${ownedBook.employeeName}</td>
           	    <td>${ownedBook.dateLent}</td>
				<td> <button id="ReturnBookCopy${ownedBook.copyId}" type="button" onclick='ReturnBookCopy(${ownedBook.copyId})'>Innemen</button>
            </tr>`;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("ownedTable").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-owned").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} employees`;

    createTablePaginationOwned(tablePage, booksInTable);
}


function createTablePaginationOwned(tablePage, itemsInTable) {
    data = JSON.parse(window.localStorage.ownedBooks);
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
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableOwned(${prevButton})">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
    for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++) {
            paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableOwned(${labelCount})">${labelCount + 1}</label>`;

    }
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableOwned(${nextButton})">Next &raquo;</label>`;
    
    document.getElementById("pagination-owned").innerHTML = paginationHTML;
}

async function main() {
    await fillBookPage();
    FillTableOwned(0);
}
main();



/*

	THIS PART OF THE SCRIPT IS TO RETURN
	A LOANED COPY AND REMOVE IT FROM THE
	DATABASE OF LOANED BOOKS

*/

async function ReturnBookCopy(copyId)
{
	let response = await fetch(backendurl + "/book/return/" + copyId, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.catch(error => {
		alert('Er is iets fouts gegaan');
	});
	
	let str = await response.json();
	alert(str.response);
	main();
}

/*

	THIS PART OF THE SCRIPT IS TO FETCH
	ALL COPIES OF THE SPECIFIC BOOK
	AND DISPLAY THEM TO LOAN

*/

function FetchCopies()
{
    let book = JSON.parse(localStorage.getItem("currentBook"));
	let bookId = book.bookId;

	fetch(backendurl + "/book/" + bookId + "/copies/").then(response => {
        return response.json();
    }).then(copies => {
		
        window.localStorage.setItem("copyBooks", JSON.stringify(copies));
        FillTableCopies(0);
    });
}

// Fill table with loaned books
function FillTableCopies(tablePage)
{
    let booksInTable = 7;
	let data = JSON.parse(window.localStorage.copyBooks);
	
    let bookTableHtml =
        `
		<thead>
			<tr>
				<th>ID</th>
				<th></th>
             </tr>
		</thead>
		<tbody>`;
		
		let bookCount = 0;
		let bookThresh = booksInTable * tablePage; 

    // Loop to access all rows 
    for (let book of data)
	{
		if (bookCount >= bookThresh && bookCount < bookThresh + booksInTable)
		{
        	bookTableHtml += `<tr>
				<td>${book.copyId}</td>`
			if (book.copyAvailable)
			{
				bookTableHtml += `<td><button type="button" onclick="FetchEmployeesForLoan(${book.copyId})">Leen uit</button></td>`
			}
			else if (book.copyArchived)
				bookTableHtml += `<td>Gearchiveerd</td>`
			else if (book.copyLent)
					bookTableHtml += `<td>Uitgeleend</td>`

			bookTableHtml += `</tr>`;
		}

		bookCount++;
    }

	bookTableHtml += `</tbody>`
	
    let bookThreshMax = data.length < bookThresh + booksInTable ? data.length : bookThresh + booksInTable;

	// Setting innerHTML of corresponding divs 
    document.getElementById("copiesTable").innerHTML = bookTableHtml;
    document.getElementById("items-wrapper-copies").innerHTML = `Showing ${bookThresh + 1} to ${bookThreshMax} of ${data.length} books`;

    createTablePaginationBookCopies(tablePage, booksInTable);
}

function createTablePaginationBookCopies(tablePage, itemsInTable)
{
	let data = JSON.parse(window.localStorage.copyBooks);
    
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
    let paginationHTML = `<label for="table_radio_3" onclick="FillTableCopies(${prevButton})">&laquo; Previous </label>`;

    if (amountOfLabels > pagesNeeded)
        amountOfLabels = pagesNeeded;

    let maxLabelNum = minLabelNum + amountOfLabels;
//   for (let labelCount = minLabelNum; labelCount < maxLabelNum; labelCount++)
//	{
//  	paginationHTML += `<label for="table_radio_${labelCount}" id="table_pager_${labelCount}" onclick="FillTableCopies(${labelCount})">${labelCount + 1}</label>`;
//	}
    
    // Cap the next button to the max amount of pages.
    let nextButton = tablePage + 1;
    if (nextButton >= pagesNeeded)
        nextButton = pagesNeeded - 1;
    
    paginationHTML += `<label for="table_radio_5" onclick="FillTableCopies(${nextButton})">Next &raquo;</label>`;
    
    document.getElementById("pagination-copies").innerHTML = paginationHTML;
}


FetchCopies();


/*

	THIS PART OF THE SCRIPT IS TO SELECT AN EMPLOYEE
	TO LOAN THE COPY TO WITHOUT HAVING TO RESERVE
	THE BOOK

*/

async function FetchEmployeesForLoan(copyId)
{
	await fetch(backendurl + "/employee").then(response => {
		return response.json();
	}).then( employees => {
		FillTableEmployeeLoan(employees, copyId);
	})

	document.getElementById("select-employee-loan").style.display = "flex";
}

// Fill table with all available copies
function FillTableEmployeeLoan(employees, copyId)
{
	let bookTableHtml =
	`<tr>
		<th>ID</th>
	</tr>`;

	// Loop to access all rows 
	for (let user of employees) {
		bookTableHtml += `<tr>
			<td>${user.employeeName}</td>
			<td><button type="button" onclick="LoanBookEmployee(${user.employeeId}, ${copyId})">Leen uit</button></td>
		</tr>`;
	}

	// Setting innerHTML as tab variable
	document.getElementById("employeesLoan").innerHTML = bookTableHtml;
}

async function LoanBookEmployee(employeeId, copyId)
{
	let response = await fetch(backendurl + "/book/loan/new/" + copyId + "/" + employeeId, {
		method: 'PUT',
		headers: {
			'Content-Type': 'application/json'
		}
	})
	.catch(error => {
		alert('Er is iets fouts gegaan');
	});

	CloseSelectEmployeePopup();
	let str = await response.json();
	alert(str.response);
	FetchCopies();
	main();
}

// Close popup
function CloseSelectEmployeePopup()
{
	document.getElementById("select-employee-loan").style.display = "none";
}
