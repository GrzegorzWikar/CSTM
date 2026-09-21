function ProfilePage() {
    return (
        <section className="page" aria-labelledby="profile-heading">
            <header className="page-header">
                <div>
                    <p className="eyebrow">Account</p>
                    <h1 id="profile-heading">Profile</h1>
                    <p className="page-header__description">
                        User information will be connected after authentication is implemented.
                    </p>
                </div>
            </header>

            <div className="content-card">
                <h2>Profile placeholder</h2>

                <dl className="details-list">
                    <div className="details-list__item">
                        <dt>User</dt>
                        <dd>Demo User</dd>
                    </div>
                    <div className="details-list__item">
                        <dt>Role</dt>
                        <dd>Not loaded</dd>
                    </div>
                    <div className="details-list__item">
                        <dt>Authentication</dt>
                        <dd>Not implemented</dd>
                    </div>
                </dl>
            </div>
        </section>
    );
}

export default ProfilePage;