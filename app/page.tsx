export default function HomePage() {
    return (
        <div className="page-container">
            <header className="app-header">
                <h1 className="app-logo">
                    BusTicGo<i className="fa-solid fa-bus"></i>
                </h1>
                <p className="app-tagline">
                    Book the ticket. And you're good to go!
                </p>
            </header>

            <form className="search-form-card">
                <h2 className="search-form-title">Find your trip</h2>
                <div className="selection-group">
                    <div className="selection-item">
                        <label htmlFor="origin-select" className="select-label">Origin</label>
                        <select id="origin-select" name="origin">
                            <option value="Kathmandu">Kathmandu</option>
                            <option value="Pokhara">Pokhara</option>
                            <option value="Biratnagar">Biratnagar</option>
                            <option value="Chitwan">Chitwan</option>
                            <option value="Itahari">Itahari</option>
                        </select>
                    </div>
                    
                    <div className="selection-item">
                        <label htmlFor="destination-select" className="select-label">Destination</label>
                        <select id="destination-select" name="destination">
                            <option value="Kathmandu">Kathmandu</option>
                            <option value="Pokhara">Pokhara</option>
                            <option value="Biratnagar">Biratnagar</option>
                            <option value="Chitwan">Chitwan</option>
                            <option value="Itahari">Itahari</option>
                        </select>
                    </div>

                    <button type="submit" className="search-button">
                        Search
                    </button>
                </div>
            </form>
        </div>
    );
}