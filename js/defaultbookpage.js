let book = JSON.parse(window.localStorage.currentBook);

console.log(backendurl + "/book/findsingle/" + book.bookId)

function FetchSingleBook()
{
    fetch(backendurl + "/book/findsingle/" + book.bookId).then(response => {
        return response.json();
    }).then( book => {
		SetBookInfo(book);
    })
}

function SetBookInfo(book)
{
	document.getElementById("bookTitle").innerHTML = book.bookTitle;
    document.getElementById("bookAuthor").innerHTML = book.bookAuthor;
    document.getElementById("bookIsbn").innerHTML = book.bookIsbn;
    document.getElementById("bookCopies").innerHTML = "Exemplaren beschikbaar: " + book.bookCopies;
	document.getElementById("bookImg").src = book.bookCover;
}

FetchSingleBook();

/*

	THIS PART OF THE SCRIPT IS TO RESERVE A BOOK
	IT TAKES THE USERS EMPLOYEEID AND SENDS
	THIS WITH THE BOOK ID TO THE DATABASE

*/

async function ReserveBook(bookId)
{
	let employeeId = localStorage.getItem("id");

	if (employeeId != null)
	{
		// book/reserve/bookId/employeeId
		let response = await fetch(backendurl + "/book/reserve/" + bookId + "/" + employeeId, {
        method: 'POST'
		}).catch(error => {
			alert('Er is iets fouts gegaan');
			console.error(error);
		});

		let str = await response.json();
		alert(str.response);
		FetchUserReserve();
		FetchUserBooks();
	}
	else
	{
		console.error("No employeeId has been found, user is not logged in properly");
		alert("Oh no, we messed up! Something went wrong fetching your ID");
	}
}

/*

	THIS PART OF THE SCRIPT IS TO LOG OFF
	FROM THE CURRENT SESSION AND DELETE
	ALL LOCAL STORAGE

*/

function OpenPage(page)
{
	localStorage.setItem("CurrentPage", page);
    window.location = "../html/userPage.html";
}

/*

	THIS PART OF THE SCRIPT IS TO LOG OFF
	FROM THE CURRENT SESSION AND DELETE
	ALL LOCAL STORAGE

*/

function LogOff()
{
	localStorage.clear();
	window.location.href = '../html/loginPage.html';
}
