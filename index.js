const searchForm = document.getElementById('search-form')
const moviesContainer = document.getElementById('movies-container')

searchForm.addEventListener('submit', (e) => {
    e.preventDefault()

    const url = 'http://www.omdbapi.com/?apikey=b88f89ad'
    const formData = new FormData(searchForm)
    const searchInput = formData.get('search-input')
    let imdbIDs = []

    fetch(`${url}&s=${encodeURIComponent(searchInput)}&type=movie`)
        .then(response => response.json())
        .then(data => {
            imdbIDs = data.Search.map((movie) => movie.imdbID)
            
            const movies = []
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

function renderMovies(movies) {
    const moviesHTML = movies.map((movie) => {

        const {Poster, Title, imdbRating, Runtime, Genre, Plot} = movie


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
                        <div class="add-to-watchlist">
                            <img class="add-icon" src="./images/add-icon.png" alt="add movie icon">
                            <p class="watchlist">Watchlist</p>
                        </div>
                    </div>
                    <p class="plot">${plot}</p>
                </div>
            </div>
        `
    })

    moviesContainer.innerHTML = moviesHTML
}