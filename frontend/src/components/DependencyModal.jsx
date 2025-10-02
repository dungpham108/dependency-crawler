import React from 'react';

const DependencyModal = ({ dependency, onClose }) => {
    if (!dependency) {
        return null; // Không hiển thị modal nếu không có dữ liệu
    }

    // Dữ liệu từ cơ sở dữ liệu
    const databaseInfo = dependency.fromDatabase[0] || {};

    // Dữ liệu từ API bên ngoài
    const apiInfo = dependency.fromExternalAPI?.npm || dependency.fromExternalAPI?.maven || {};

    return (
        <div
            className="modal fade show d-block"
            style={{ background: 'rgba(0, 0, 0, 0.5)' }}
            tabIndex="-1"
            role="dialog"
        >
            <div className="modal-dialog modal-dialog-scrollable modal-lg" role="document">
                <div className="modal-content">
                    <div className="modal-header">
                        <h5 className="modal-title">Dependency Details</h5>
                        <button
                            type="button"
                            className="btn-close"
                            onClick={onClose}
                            aria-label="Close"
                        ></button>
                    </div>
                    <div className="modal-body">
                        {/* Thông tin từ cơ sở dữ liệu */}
                        <h6 className="mb-3">From Database:</h6>
                        <p>
                            <strong>Name:</strong> {databaseInfo.name || 'N/A'}
                        </p>
                        <p>
                            <strong>Version:</strong> {databaseInfo.version || 'N/A'}
                        </p>
                        <p>
                            <strong>Type:</strong> {databaseInfo.type || 'N/A'}
                        </p>
                        <p>
                            <strong>Source:</strong> {databaseInfo.source || 'N/A'}
                        </p>

                        <hr />

                        {/* Thông tin từ API bên ngoài */}
                        <h6 className="mb-3">From External API:</h6>
                        <p>
                            <strong>Description:</strong>{' '}
                            {apiInfo.description || 'No description available'}
                        </p>
                        <p>
                            <strong>Latest Version:</strong> {apiInfo.latestVersion || 'Unknown'}
                        </p>
                        <p>
                            <strong>Homepage:</strong>{' '}
                            {apiInfo.homepage ? (
                                <a
                                    href={apiInfo.homepage}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {apiInfo.homepage}
                                </a>
                            ) : (
                                'No homepage available'
                            )}
                        </p>
                        <p>
                            <strong>Repository:</strong>{' '}
                            {apiInfo.repository ? (
                                <a
                                    href={apiInfo.repository}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                >
                                    {apiInfo.repository}
                                </a>
                            ) : (
                                'No repository available'
                            )}
                        </p>
                        <p>
                            <strong>License:</strong> {apiInfo.license || 'No license specified'}
                        </p>
                    </div>
                    <div className="modal-footer">
                        <button
                            type="button"
                            className="btn btn-secondary"
                            onClick={onClose}
                        >
                            Close
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DependencyModal;
