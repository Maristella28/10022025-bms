import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Container,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';

const PrivacyPolicyPage = () => {
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      <Paper elevation={3} sx={{ p: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom align="center" color="primary">
          Privacy Policy
        </Typography>

        <Typography variant="h6" gutterBottom color="textSecondary" align="center">
          Barangay Management System
        </Typography>

        <Divider sx={{ my: 3 }} />

        <Typography variant="body1" paragraph>
          <strong>Effective Date:</strong> {new Date().toLocaleDateString()}
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          1. Introduction
        </Typography>

        <Typography variant="body1" paragraph>
          Welcome to the Barangay Management System ("we," "our," or "us"). We are committed to protecting your privacy and ensuring the security of your personal information. This Privacy Policy explains how we collect, use, disclose, and safeguard your information when you use our system.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          2. Information We Collect
        </Typography>

        <Typography variant="h6" gutterBottom>
          2.1 Personal Information
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="• Full name, email address, and contact information" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Residential address and barangay information" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Date of birth, civil status, and other demographic data" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Government-issued IDs and verification documents" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Profile pictures and other uploaded documents" />
          </ListItem>
        </List>

        <Typography variant="h6" gutterBottom sx={{ mt: 2 }}>
          2.2 Usage Information
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="• Login and logout times" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Pages visited and features used" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• IP address and device information" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Actions performed within the system" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          3. How We Use Your Information
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="• Provide barangay services and document processing" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Verify your identity and eligibility for services" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Maintain accurate resident records" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Generate reports for barangay officials" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Ensure system security and prevent unauthorized access" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Comply with legal and regulatory requirements" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Improve system functionality and user experience" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          4. Information Sharing and Disclosure
        </Typography>

        <Typography variant="body1" paragraph>
          We do not sell, trade, or otherwise transfer your personal information to third parties except in the following circumstances:
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="• With your explicit consent" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• To comply with legal obligations or court orders" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• To protect the rights, property, or safety of our users or the public" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• With authorized barangay officials for legitimate governmental purposes" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• With service providers who assist in system operations (under strict confidentiality agreements)" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          5. Data Security
        </Typography>

        <Typography variant="body1" paragraph>
          We implement comprehensive security measures to protect your personal information:
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="• Encryption of data in transit and at rest" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Secure user authentication and authorization" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Regular security audits and vulnerability assessments" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Access controls and role-based permissions" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Activity logging and monitoring" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Secure backup and disaster recovery procedures" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          6. Data Retention
        </Typography>

        <Typography variant="body1" paragraph>
          We retain your personal information for as long as necessary to provide our services and comply with legal obligations. Resident records are typically retained indefinitely for historical and governmental purposes, unless you request deletion in accordance with applicable laws.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          7. Your Rights
        </Typography>

        <Typography variant="body1" paragraph>
          You have the following rights regarding your personal information:
        </Typography>

        <List>
          <ListItem>
            <ListItemText primary="• Right to access your personal information" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Right to correct inaccurate information" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Right to request deletion of your information (subject to legal requirements)" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Right to data portability" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Right to object to certain processing activities" />
          </ListItem>
          <ListItem>
            <ListItemText primary="• Right to withdraw consent" />
          </ListItem>
        </List>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          8. Cookies and Tracking
        </Typography>

        <Typography variant="body1" paragraph>
          We use cookies and similar technologies to enhance your experience, maintain session security, and analyze system usage. You can control cookie settings through your browser preferences.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          9. Third-Party Services
        </Typography>

        <Typography variant="body1" paragraph>
          Our system may integrate with third-party services for email verification, document processing, or other functionalities. These third parties are bound by confidentiality agreements and are not permitted to use your information for their own purposes.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          10. Children's Privacy
        </Typography>

        <Typography variant="body1" paragraph>
          Our services are intended for adults and residents of legal age. We do not knowingly collect personal information from children under 18 without parental consent.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          11. Changes to This Privacy Policy
        </Typography>

        <Typography variant="body1" paragraph>
          We may update this Privacy Policy from time to time. We will notify you of any material changes by posting the new policy on this page and updating the effective date.
        </Typography>

        <Typography variant="h5" gutterBottom sx={{ mt: 3 }}>
          12. Contact Us
        </Typography>

        <Typography variant="body1" paragraph>
          If you have any questions about this Privacy Policy or our data practices, please contact:
        </Typography>

        <Box sx={{ bgcolor: 'grey.100', p: 2, borderRadius: 1, mt: 2 }}>
          <Typography variant="body1">
            <strong>Barangay Management System</strong><br />
            Privacy Officer<br />
            Email: privacy@barangay-system.com<br />
            Phone: [Contact Number]<br />
            Address: [Barangay Office Address]
          </Typography>
        </Box>

        <Typography variant="body2" sx={{ mt: 3, fontStyle: 'italic', textAlign: 'center' }}>
          By using our system, you acknowledge that you have read, understood, and agree to be bound by this Privacy Policy.
        </Typography>
      </Paper>
    </Container>
  );
};

export default PrivacyPolicyPage;
