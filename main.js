$(document).ready(() => {
    getMovies('dragon');
    $('#searchForm').on('submit', (e) => {
        const searchText = $('#searchText').val();
        getMovies(searchText);
        e.preventDefault();
    });

    var modals = document.querySelectorAll('.modal')
    modals.forEach(function(modal) {
      new bootstrap.Modal(modal);
    });
});

$(document).on('click', '.movie-details', function(e) {
    e.preventDefault();
    const imdbID = $(this).data('imdbid');
    movieSelected(imdbID);
});

$('#searchButton').click(function(e) {
    console.log('button clicked')
    e.preventDefault();
    const searchText = $('#searchText').val();
    getMovies(searchText);
});
$(document).on('click', '#loadButton', function(e) {
    console.log('button clicked')
    e.preventDefault();
    const searchText = $('#searchText').val();
    loadMoreMovies(searchText);
});

const API_KEY = '9dc0362c';
const MAX_RESULTS = 30;
let allMovies = [];
let currentPage = 1;

async function getMovies(searchText) {
    try {
        allMovies = [];
        currentPage = 1;

        while (allMovies.length < MAX_RESULTS) {
            const response = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchText}&page=${currentPage}`);
            console.log(response)
            if (response.data.Response === "True") {
                allMovies = [...allMovies, ...response.data.Search];
                if (allMovies.length >= MAX_RESULTS || response.data.Search.length < 10) {
                    break;
                }
                currentPage++;
            } else {
                break;
            }
        }

        displayMovies();
    } catch (err) {
        console.log(err);
    }
}

async function loadMoreMovies(searchText) {
    try {
        currentPage++;
        const response = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&s=${searchText}&page=${currentPage}`);
        console.log(response);

        if (response.data.Response === "True") {
            allMovies = [...allMovies, ...response.data.Search];
            displayMovies();
        }
    } catch (err) {
        console.log(err);
    }
}

function displayMovies() {
    let output = '';
    $.each(allMovies, (index, movie) => {
        output += `
        <div class="col-md-6 col-md-4 col-lg-3 mb-4">
            <div class="card h-100 d-flex flex-column text-center">
                <div class="card-img-top-wrapper">
                    <img src="${movie.Poster === 'N/A' ? 'images/placeholder.png' : movie.Poster}" class="card-img-top" onerror="this.onerror=null; this.src='images/placeholder.png';" alt="${movie.Title} poster">
                </div>
                <div class="card-body d-flex flex-column" id="titleBox">
                    <h5 class="card-title flex-grow-1">${movie.Title}</h5>
                    <a href="#" class="btn btn-primary movie-details" data-imdbid="${movie.imdbID}">More Details</a>
                </div>
            </div>
        </div>
        `;
    });
    output += `
        <div class="col-md-6 col-md-4 col-lg-3 mb-4 loadButton">
            <button type="button" class="btn btn-primary btn-lg" id="loadButton">Load More</button>
        </div>
    `;

    $('#movies').html(output);
}

async function movieSelected(imdbID) {
    var movieModal = new bootstrap.Modal(document.getElementById('movieModal'));
    let movieDetails = `
        <div class="modal-header">
            <h5 class="modal-title" id="movieModalLabel">Loading...</h5>
        </div>
        <div class="modal-body text-center">
            <div class="loading-spinner">
                <img src="images/icons8-loading.gif" alt="Loading icon">
            </div>
            <p class="mt-3">Fetching movie details...</p>
        </div>
    `;
    $('#movieDetails').html(movieDetails);
    movieModal.show();

    try {
        const response = await axios.get(`http://www.omdbapi.com/?apikey=${API_KEY}&i=${imdbID}`);
        console.log(response);
        let movie = response.data;
        
        movieDetails = `
            <div class="modal-header">
                <h5 class="modal-title" id="movieModalLabel">${movie.Title}</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <div class="row">
                    <div class="col-md-4">
                        <img src="${movie.Poster !== 'N/A' ? movie.Poster : 'images/placeholder.png'}" 
                             class="card-img-top" 
                             alt="${movie.Title} poster"
                             onerror="this.onerror=null; this.src='images/placeholder.png';">
                    </div>
                    <div class="col-md-8">
                        <ul class="list-group">
                            <li class="list-group-item"><strong>Release Year:</strong> ${movie.Year}</li>
                            <li class="list-group-item"><strong>Genre:</strong> ${movie.Genre}</li>
                            <li class="list-group-item"><strong>Rated:</strong> ${movie.Rated}</li>
                            <li class="list-group-item"><strong>IMDb Rating:</strong> ${movie.imdbRating}</li>
                            <li class="list-group-item"><strong>Director:</strong> ${movie.Director}</li>
                            <li class="list-group-item"><strong>Actors:</strong> ${movie.Actors}</li>
                            <li class="list-group-item">${movie.Plot}</li>
                        </ul>
                    </div>
                </div>
            </div>
            <div class="modal-footer">
                <div class="ratings">
                    <span class="badge bg-secondary"><img src="https://cdn-icons-png.flaticon.com/512/590/590779.png" height="15px" alt="Movie Icon"> ${movie.Ratings[1] ? movie.Ratings[1].Value : 'N/A' }</span>
                    <span class="badge bg-secondary"><img src="https://cdn-icons-png.flaticon.com/512/7656/7656139.png" height="15px" alt="Movie Icon"> ${movie.Ratings[0] ? movie.Ratings[0].Value : 'N/A'}</span>
                </div>
                <a href="http://imdb.com/title/${movie.imdbID}" target="_blank"><button type="button" class="btn btn-primary">View IMDb</button></a>
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
        $('#movieDetails').html(movieDetails);
    } catch (error) {
        console.error('Error fetching movie details:', error);
        movieDetails = `
            <div class="modal-header">
                <h5 class="modal-title" id="movieModalLabel">Error</h5>
                <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
            </div>
            <div class="modal-body">
                <p>Sorry, there was an error fetching the movie details. Please try again later.</p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Close</button>
            </div>
        `;
        $('#movieDetails').html(movieDetails);
    }
}