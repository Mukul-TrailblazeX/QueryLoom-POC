import * as React from "react";
import Button from "@mui/material/Button";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogContentText from "@mui/material/DialogContentText";
import DialogTitle from "@mui/material/DialogTitle";
import TextField from "@mui/material/TextField";

export default function ForgotPassword({ open, handleClose }) {
    return (
        <Dialog open={open} onClose={handleClose}>
            <DialogTitle>Reset password</DialogTitle>
            <DialogContent>
                <DialogContentText sx={{ mb: 2 }}>
                    Enter your email address and we&apos;ll send you a password reset link.
                </DialogContentText>
                <TextField autoFocus fullWidth margin="dense" id="reset-email" label="Email" type="email" variant="outlined" />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={handleClose} variant="contained">Send link</Button>
            </DialogActions>
        </Dialog>
    );
}
