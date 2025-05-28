export async function fetchWrestlingTVShows(query = "wrestling") {
    const apiKey = process.env.TMDB_API_KEY
    const url = `https://api.themoviedb.org/3/search/tv?query=${encodeURIComponent(query)}&api_key=${apiKey}`

    const res = await fetch(url)
    const data = await res.json()

    const allowedPromotions = ["WWE", "AEW", "ROH", "TNA", "Impact", "Raw", "SmackDown", "NXT", "Dynamite", "Collision", "NJPW", "Evolve"]
    return data.results
        .filter((item: any) => {
            return allowedPromotions.some((promo) =>
                item.name.toLowerCase().includes(promo.toLowerCase())
            )
        })
        .map((item: any) => ({
            id: item.id,
            name: item.name,
            slug: item.name.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
            date: item.first_air_date,
            poster: `https://image.tmdb.org/t/p/w500${item.poster_path}`,
        }))
}