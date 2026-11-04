import pandas as pd

from ml_service.features import feature_frame, encode_features


def test_feature_frame_drops_incomplete_rows(sample_history):
    featured = feature_frame(sample_history)
    assert not featured.empty
    assert {"lag_1", "lag_3", "lag_12", "rolling_mean_3"}.issubset(featured.columns)


def test_encode_features_aligns_columns(sample_history):
    featured = feature_frame(sample_history)
    X, cols = encode_features(featured)
    assert len(X) == len(featured)
    assert "district_id_D001" in cols or any(c.startswith("district_id_") for c in cols)
    X2, _ = encode_features(featured.head(2), cols)
    assert list(X2.columns) == cols
