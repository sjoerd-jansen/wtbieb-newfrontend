let book = JSON.parse(window.localStorage.currentBook);

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
	let rating = (Math.round(book.bookRating * 100) / 100).toFixed(2);
	document.getElementById("bookTitle").innerHTML = book.bookTitle;
    document.getElementById("bookAuthor").innerHTML = book.bookAuthor;
    document.getElementById("bookIsbn").innerHTML = book.bookIsbn;
    document.getElementById("bookCopies").innerHTML = "Exemplaren beschikbaar: " + book.bookCopies;
	document.getElementById("bookImg").src = book.bookCover;

	if (book.bookRating > 0)
		document.getElementById("bookRating").innerHTML = "Rating: " + rating + " sterren op basis van " + book.usersRated + " beoordeling(en)";
	else
		document.getElementById("bookRating").innerHTML = "Dit boek heeft nog geen beoordelingen";
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

/*

	THIS PART OF THE SCRIPT IS TO LOG OFF
	FROM THE CURRENT SESSION AND DELETE
	ALL LOCAL STORAGE

*/

let star1 = document.getElementById("oneStar");
let star2 = document.getElementById("twoStar");
let star3 = document.getElementById("threeStar");
let star4 = document.getElementById("fourStar");
let star5 = document.getElementById("fiveStar");

let starList = [star1, star2, star3, star4, star5];

function StarHover(starNum)
{
	let imgHover = "../images/starSelected.png";

	for (let i=0; i<starNum; i++)
	{
		starList[i].src = imgHover;
	}
}

function StarClear(starNum)
{
	let imgClear = "../images/starNotSelected.png";

	for (let i=0; i<starNum; i++)
	{
		starList[i].src = imgClear;
	}	
}

/*

	THIS PART OF THE SCRIPT IS TO RATE
	A BOOK BASED ON THE STARS SELECTED

*/

async function RateBook(userRating)
{
	let employeeId = localStorage.getItem("id");

	if (employeeId != null)
	{
		// book/{bookId}/{employeeId}/rating?rating=userRating
		let response = await fetch(backendurl + "/book/" + book.bookId + "/" + employeeId + "/rating?rating=" + userRating, {
        method: 'POST'
		}).catch(error => {
			alert('Er is iets fouts gegaan');
			console.error(error);
		});

		let str = await response.json();
		alert(str.response);
	}
	else
	{
		console.error("No employeeId has been found, user is not logged in properly");
		alert("Oh no, we messed up! Something went wrong fetching your ID");
	}
}