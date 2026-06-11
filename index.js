const searchForm = document.getElementById('search-form')
const moviesContainer = document.getElementById('movies-container')
let watchlist = JSON.parse(localStorage.getItem("watchlist")) || []
const isWatchlistPage = window.location.pathname.endsWith('watchlist.html')
const movies = []

if (searchForm) { // only run the following code if on the main homepage with the search bar
    searchForm.addEventListener('submit', (e) => {
        e.preventDefault()
        movies.length = 0
    
        const url = 'http://www.omdbapi.com/?apikey=b88f89ad'
        const formData = new FormData(searchForm)
        const searchInput = formData.get('search-input')
        let imdbIDs = []
    
        fetch(`${url}&s=${encodeURIComponent(searchInput)}&type=movie`)
            .then(response => response.json())
            .then(data => {
                if (data.Response === "False") {
                    renderSearchFail()
                    return;
                }
    
                imdbIDs = data.Search.map((movie) => movie.imdbID)
    
                imdbIDs.forEach((imdbID) => {
                    fetch(`${url}&i=${imdbID}`)
                        .then(response => response.json())
                        .then(movie => {
                            movies.push(movie)
                            if (movies.length === imdbIDs.length) {
                                renderMovies(movies)
                            }
                    })
                })
            })
    })
}

function renderSearchFail() {
    moviesContainer.innerHTML = `
        <h2 class="movies-container-header">Unable to find what you're looking for. Please try another search.</h2>
    `

    moviesContainger.classList.add('empty')
}

function renderMovies(movies) {
    const moviesHTML = movies.map((movie) => {

        const {Poster, Title, imdbRating, Runtime, Genre, Plot, imdbID} = movie


        // do not display 'N/A' on movie results
        const runtime = Runtime !== 'N/A' ? Runtime : ''
        const genre = Genre !== 'N/A' ? Genre : ''
        const plot = Plot !== 'N/A' ? Plot : 'No plot available.'
        const rating = imdbRating !== 'N/A' ? imdbRating : 'Not rated'
        const poster = Poster !== 'N/A' ? Poster : './images/image-not-found.avif'

        return `
            <div class="movie-card">
                <img 
                    src="${poster}" 
                    alt="movie poster" 
                    class="movie-poster"
                    onerror="this.src='./images/image-not-found.avif'"
                >
                <div class="movie-details">
                    <div class="movie-header">
                        <h2 class="title">${Title}</h2>
                        <img class="rating-icon" src="./images/star.png" alt="yellow star icon">
                        <p class="imdb-rating">${rating}</p>
                    </div>
                    <div class="movie-meta">
                        ${runtime ? `<p class="runtime">${runtime}</p>` : ''}
                        ${genre ? `<p class="genre">${genre}</p>` : ''}
                        <div class="watchlist-toggle">
                        ${
                            window.location.pathname.endsWith('watchlist.html') ?
                                `<img
                                    data-imdb-id="${imdbID}" 
                                    class="remove-from-watchlist toggle-watchlist-icon" 
                                    src="./images/remove-icon.png" 
                                    alt="remove movie icon"
                                >
                                <p class="remove">Remove</p>`
                            :
                                window.location.pathname.endsWith('index.html') &&
                                watchlist.some(movie => movie.imdbID === imdbID) 
                                ? `
                                <img
                                    data-imdb-id="${imdbID}" 
                                    class="remove-from-watchlist toggle-watchlist-icon" 
                                    src="./images/remove-icon.png" 
                                    alt="remove movie icon">
                                    <p class="watchlist">Watchlist</p>` 
                                    
                                : `
                                <img 
                                    data-imdb-id="${imdbID}" 
                                    class="add-to-watchlist toggle-watchlist-icon" 
                                    src="./images/add-icon.png" 
                                    alt="add movie icon">
                                    <p class="watchlist">Watchlist</p>`
                                }
                        </div>
                    </div>
                    <p class="plot">${plot}</p>
                </div>
            </div>
        `
    })

    moviesContainer.innerHTML = moviesHTML
}

document.addEventListener('click', (e) => {
    if (e.target.classList.contains('add-to-watchlist') && window.location.pathname.endsWith('index.html')) {

        // add movie selected to localStorage
        const imdbID = e.target.dataset.imdbId
        const movieToAdd = movies.find((movie) => movie.imdbID === imdbID)

        if (!watchlist.some(movie => movie.imdbID === imdbID)) {
            watchlist.push(movieToAdd)
            localStorage.setItem('watchlist', JSON.stringify(watchlist))
        }


        // change add to watchlist option to remove from watchlist
        const watchlistToggle = e.target.closest('.watchlist-toggle')
        watchlistToggle.innerHTML = `
            <img data-imdb-ID="${imdbID}" class="remove-from-watchlist toggle-watchlist-icon" src="./images/remove-icon.png" alt="remove movie icon">
            <p class="watchlist">Watchlist</p>
        `
    }

    if (e.target.classList.contains('remove-from-watchlist') && window.location.pathname.endsWith('index.html')) {
        const imdbID = e.target.dataset.imdbId
        
        watchlist = watchlist.filter((movie) => movie.imdbID !== imdbID)
        
        if (!watchlist.length) {
            localStorage.removeItem('watchlist')
        } else {
            localStorage.setItem('watchlist', JSON.stringify(watchlist))
        }

        const watchlistToggle = e.target.closest('.watchlist-toggle')
        watchlistToggle.innerHTML = `
            <img data-imdb-ID="${imdbID}" class="add-to-watchlist toggle-watchlist-icon" src="./images/add-icon.png" alt="add movie icon">
            <p class="watchlist">Watchlist</p>
        `
    }

    if (e.target.classList.contains('remove-from-watchlist') && window.location.pathname.endsWith('watchlist.html')) {
        const imdbID = e.target.dataset.imdbId
        
        watchlist = watchlist.filter((movie) => movie.imdbID !== imdbID)
        
        if (!watchlist.length) {
            localStorage.removeItem('watchlist')
            renderWatchlistPage()

        } else {
            localStorage.setItem('watchlist', JSON.stringify(watchlist))
            renderMovies(watchlist)
        }
    }
})

function renderWatchlistPage() {
    if (window.location.pathname.endsWith('watchlist.html')) {
        if (!watchlist.length) {
            moviesContainer.classList.add('empty')
    
            moviesContainer.innerHTML = `
                <h2 class="movies-container-header">Your watchlist is looking a little empty...</h2>
                <div class="search-movies">
                    <a href="index.html">
                        <img src="./images/add-icon.png" alt="add movies icon">
                        <p>Let's add some movies!</p>
                    <a>
                </div>
            `
        } else {
            renderMovies(watchlist)
        }
    }
}

renderWatchlistPage()