import React, { useState } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';

import { Container, Row, Col } from 'react-bootstrap';

import { 
  Paper, 
  Typography, 
  TextField, 
  MenuItem, 
  Button, 
  Alert, 
  FormControlLabel, 
  Switch 
} from '@mui/material';

import AccountBalanceWalletIcon from '@mui/icons-material/AccountBalanceWallet';

const HOME_OPTIONS = ['RENT', 'MORTGAGE', 'OWN', 'OTHER'];
const INTENT_OPTIONS = ['PERSONAL', 'EDUCATION', 'MEDICAL', 'VENTURE', 'HOMEIMPROVEMENT', 'DEBTCONSOLIDATION'];

export default function CreditRiskForm() {
  const [formData, setFormData] = useState({
    person_age: '',
    person_income: '',
    person_home_ownership: 'RENT',
    person_emp_length: '',
    loan_intent: 'PERSONAL',
    loan_amnt: '',
    loan_int_rate: '',
    cb_person_cred_hist_length: '',
    cb_person_default_on_file: false,
  });

  const [prediction, setPrediction] = useState(null);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? checked : value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const response = await fetch('http://localhost:5000/predict', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      const data = await response.json();

      if (data.status === 'success') {
        // 0 usually means "No Default" (Approved), 1 means "Default" (Rejected)
        setPrediction(data.loan_status === 0 ? 'Approved' : 'Rejected');
      } else {
        console.error("Model Error:", data.error);
      }
    } catch (error) {
      console.error("Connection Error:", error);
    }
  };

  return (
    <Container className="py-5">
      <Row className="justify-content-center">
        <Col md={10} lg={8}>
          <Paper elevation={4} className="p-4 rounded-4">
            <Typography variant="h5" className="mb-4 text-center d-flex align-items-center justify-content-center gap-2">
              <AccountBalanceWalletIcon color="primary" /> Loan Risk Assessment
            </Typography>

            <form onSubmit={handleSubmit}>
              <div className="row g-4">
                {/* Personal Information */}
                <div className="col-md-6">
                  <TextField fullWidth label="Age" name="person_age" type="number" variant="outlined" onChange={handleInputChange} required />
                </div>
                <div className="col-md-6">
                  <TextField fullWidth label="Annual Income ($)" name="person_income" type="number" variant="outlined" onChange={handleInputChange} required />
                </div>

                {/* Employment & Home */}
                <div className="col-md-6">
                  <TextField fullWidth select label="Home Ownership" name="person_home_ownership" value={formData.person_home_ownership} onChange={handleInputChange}>
                    {HOME_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>
                </div>
                <div className="col-md-6">
                  <TextField fullWidth label="Employment Length (Yrs)" name="person_emp_length" type="number" variant="outlined" onChange={handleInputChange} required />
                </div>

                {/* Loan Details */}
                <div className="col-md-6">
                  <TextField fullWidth select label="Loan Intent" name="loan_intent" value={formData.loan_intent} onChange={handleInputChange}>
                    {INTENT_OPTIONS.map((opt) => <MenuItem key={opt} value={opt}>{opt}</MenuItem>)}
                  </TextField>
                </div>
                <div className="col-md-6">
                  <TextField fullWidth label="Loan Amount ($)" name="loan_amnt" type="number" variant="outlined" onChange={handleInputChange} required />
                </div>

                <div className="col-md-6">
                  <TextField fullWidth label="Interest Rate (%)" name="loan_int_rate" type="number" variant="outlined" onChange={handleInputChange} required />
                </div>
                <div className="col-md-6">
                  <TextField fullWidth label="Credit Hist. Length" name="cb_person_cred_hist_length" type="number" variant="outlined" onChange={handleInputChange} required />
                </div>

                <div className="col-12 border-top pt-3">
                  <FormControlLabel
                    control={<Switch checked={formData.cb_person_default_on_file} onChange={handleInputChange} name="cb_person_default_on_file" color="error" />}
                    label="Has previous default on record?"
                  />
                </div>

                <div className="col-12 mt-4">
                  <Button type="submit" variant="contained" size="large" fullWidth>
                    Run Model Prediction
                  </Button>
                </div>
              </div>
            </form>

            {prediction && (
              <Alert severity={prediction.includes('Rejected') ? "error" : "success"} className="mt-4 shadow-sm">
                Prediction: <strong>{prediction}</strong>
              </Alert>
            )}
          </Paper>
        </Col>
      </Row>
    </Container>
  );
}