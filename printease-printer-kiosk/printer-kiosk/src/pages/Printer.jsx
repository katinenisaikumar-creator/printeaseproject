import { useCallback, useEffect, useRef, useState } from "react";
import Box from "@mui/material/Box";
import Paper from "@mui/material/Paper";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Divider from "@mui/material/Divider";
import Snackbar from "@mui/material/Snackbar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import Fade from "@mui/material/Fade";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Chip from "@mui/material/Chip";
import PrintIcon from "@mui/icons-material/Print";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import LocalPrintshopRoundedIcon from "@mui/icons-material/LocalPrintshopRounded";
import DescriptionRoundedIcon from "@mui/icons-material/DescriptionRounded";
import { verifyPin, completePrintJob } from "../services/api.js";
import api from "../services/api.js";

const PIN_LENGTH = 4;
const RETURN_TO_PIN_DELAY_MS = 4000;

export default function Printer() {
  const [screen, setScreen] = useState("pin");
  const [digits, setDigits] = useState(Array(PIN_LENGTH).fill(""));
  const [printJob, setPrintJob] = useState(null);
  const [verifying, setVerifying] = useState(false);
  const [printing, setPrinting] = useState(false);
  const [paperLevel, setPaperLevel] = useState(() => {
    return Number(localStorage.getItem("kiosk_paper_level")) || 100;
  });
  const [snackbar, setSnackbar] = useState({ open: false, message: "", severity: "info" });

  const [printerId, setPrinterId] = useState(() => localStorage.getItem("kiosk_printer_id") || "1");
  const [location, setLocation] = useState(() => localStorage.getItem("kiosk_printer_location") || "");
  const [openSetup, setOpenSetup] = useState(!localStorage.getItem("kiosk_printer_location"));
  const [tempId, setTempId] = useState(printerId);
  const [tempLocation, setTempLocation] = useState(location);

  const inputRefs = useRef([]);
  const returnTimerRef = useRef(null);

  const pin = digits.join("");
  const isPinComplete = pin.length === PIN_LENGTH;

  // Heartbeat function to send status to backend PostgreSQL table
  const sendHeartbeat = useCallback(async () => {
    const activeLocation = localStorage.getItem("kiosk_printer_location");
    const activeId = localStorage.getItem("kiosk_printer_id");

    if (!activeLocation || !activeId) return;

    try {
      await api.post("/printers/heartbeat", {
        id: Number(activeId),
        name: `Printer ${activeId}`,
        location: activeLocation,
        status: printing ? "Busy" : "Online",
        paper_level: paperLevel,
        queue_count: screen === "job" ? 1 : 0,
      });
    } catch (err) {
      console.error("Heartbeat ping failed:", err);
    }
  }, [printing, screen, paperLevel]);

  useEffect(() => {
    if (openSetup) return;
    sendHeartbeat();
    const interval = setInterval(sendHeartbeat, 5000);
    return () => clearInterval(interval);
  }, [openSetup, sendHeartbeat]);

  const handleSaveSetup = () => {
    if (!tempLocation.trim()) return;
    localStorage.setItem("kiosk_printer_id", tempId);
    localStorage.setItem("kiosk_printer_location", tempLocation);
    setPrinterId(tempId);
    setLocation(tempLocation);
    setOpenSetup(false);
  };

  const closeSnackbar = () => setSnackbar((s) => ({ ...s, open: false }));
  const showSnackbar = (message, severity = "info") =>
    setSnackbar({ open: true, message, severity });

  const resetToPinScreen = useCallback(() => {
    setDigits(Array(PIN_LENGTH).fill(""));
    setPrintJob(null);
    setScreen("pin");
    setTimeout(() => inputRefs.current[0]?.focus(), 50);
  }, []);

  useEffect(() => {
    return () => {
      if (returnTimerRef.current) clearTimeout(returnTimerRef.current);
    };
  }, []);

  useEffect(() => {
    if (screen === "pin" && !openSetup) {
      inputRefs.current[0]?.focus();
    }
  }, [screen, openSetup]);

  const handleDigitChange = (index, value) => {
    const clean = value.replace(/[^0-9]/g, "").slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = clean;
      return next;
    });
    if (clean && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === "Backspace") {
      if (!digits[index] && index > 0) {
        inputRefs.current[index - 1]?.focus();
        setDigits((prev) => {
          const next = [...prev];
          next[index - 1] = "";
          return next;
        });
      }
    } else if (e.key === "Enter" && isPinComplete) {
      handleVerify();
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < PIN_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
    }
  };

  const handlePaste = (e) => {
    const text = e.clipboardData.getData("text").replace(/[^0-9]/g, "").slice(0, PIN_LENGTH);
    if (!text) return;
    e.preventDefault();
    const next = Array(PIN_LENGTH).fill("");
    for (let i = 0; i < text.length; i++) next[i] = text[i];
    setDigits(next);
    const focusIndex = Math.min(text.length, PIN_LENGTH - 1);
    inputRefs.current[focusIndex]?.focus();
  };

  const handleVerify = async () => {
    if (!isPinComplete || verifying) return;
    setVerifying(true);
    try {
      const data = await verifyPin(pin);
      if (data?.success && data?.print_job) {
        setPrintJob(data.print_job);
        setScreen("job");
      } else {
        showSnackbar("Incorrect PIN. Please try again.", "error");
        setDigits(Array(PIN_LENGTH).fill(""));
        inputRefs.current[0]?.focus();
      }
    } catch (err) {
      const message =
        err?.response?.data?.message ||
        (err?.response?.status === 404
          ? "No print job found for this PIN."
          : "Could not reach the print server. Please try again.");
      showSnackbar(message, "error");
      setDigits(Array(PIN_LENGTH).fill(""));
      inputRefs.current[0]?.focus();
    } finally {
      setVerifying(false);
    }
  };

  const handlePrint = async () => {
    if (!printJob || printing) return;
    setPrinting(true);
    try {
      await completePrintJob(printJob.id);
      
      // Calculate and update paper reduction dynamically
      const pagesUsed = (Number(printJob.page_count) || 1) * (Number(printJob.copies) || 1);
      const newPaperLevel = Math.max(0, paperLevel - pagesUsed);
      setPaperLevel(newPaperLevel);
      localStorage.setItem("kiosk_paper_level", newPaperLevel);

      setScreen("success");
      showSnackbar("Print job completed.", "success");
      returnTimerRef.current = setTimeout(resetToPinScreen, RETURN_TO_PIN_DELAY_MS);
    } catch (err) {
      const message =
        err?.response?.data?.message || "Printing failed. Please try again or contact staff.";
      showSnackbar(message, "error");
    } finally {
      setPrinting(false);
    }
  };

  return (
    <>
      <Paper
        elevation={0}
        sx={{
          width: "100%",
          maxWidth: 480,
          borderRadius: 6,
          p: { xs: 4, sm: 6 },
          boxShadow: "0 30px 80px -20px rgba(11, 18, 48, 0.55)",
          border: "1px solid rgba(255,255,255,0.6)",
          position: "relative",
        }}
      >
        <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
          <Chip
            label={`Printer #${printerId} — ${location || "Unconfigured"}`}
            variant="outlined"
            size="small"
            onClick={() => setOpenSetup(true)}
            sx={{ fontWeight: 600, cursor: "pointer" }}
          />
          <Chip
            label={printing ? "BUSY" : "ONLINE"}
            color={printing ? "warning" : "success"}
            size="small"
            sx={{ fontWeight: 700, fontSize: "0.75rem" }}
          />
        </Box>

        {screen === "pin" && (
          <Fade in>
            <Box>
              <PinScreen
                digits={digits}
                inputRefs={inputRefs}
                verifying={verifying}
                isPinComplete={isPinComplete}
                onDigitChange={handleDigitChange}
                onKeyDown={handleKeyDown}
                onPaste={handlePaste}
                onVerify={handleVerify}
              />
            </Box>
          </Fade>
        )}

        {screen === "job" && printJob && (
          <Fade in>
            <Box>
              <JobScreen 
                printJob={printJob} 
                printing={printing} 
                onPrint={handlePrint} 
                onBack={resetToPinScreen} 
              />
            </Box>
          </Fade>
        )}

        {screen === "success" && (
          <Fade in>
            <Box>
              <SuccessScreen />
            </Box>
          </Fade>
        )}
      </Paper>

      <Dialog open={openSetup} disableEscapeKeyDown>
        <DialogTitle sx={{ fontWeight: 700 }}>Terminal Location Setup</DialogTitle>
        <DialogContent>
          <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
            Assign this physical device terminal a Printer ID and Location.
          </Typography>
          <Stack spacing={2} sx={{ pt: 1 }}>
            <TextField
              label="Printer ID"
              type="number"
              fullWidth
              value={tempId}
              onChange={(e) => setTempId(e.target.value)}
            />
            <TextField
              label="Physical Location (e.g., Library - Floor 1)"
              fullWidth
              value={tempLocation}
              onChange={(e) => setTempLocation(e.target.value)}
              required
            />
          </Stack>
        </DialogContent>
        <DialogActions sx={{ p: 2 }}>
          <Button onClick={handleSaveSetup} variant="contained" disabled={!tempLocation.trim()}>
            Save & Start Kiosk
          </Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={closeSnackbar}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert onClose={closeSnackbar} severity={snackbar.severity} variant="filled" sx={{ fontWeight: 500 }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </>
  );
}

function PinScreen({ digits, inputRefs, verifying, isPinComplete, onDigitChange, onKeyDown, onPaste, onVerify }) {
  return (
    <Stack spacing={4} alignItems="center">
      <Stack spacing={1.5} alignItems="center">
        <Box
          sx={{
            width: 72,
            height: 72,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "linear-gradient(135deg, #1E4FD8, #122F94)",
            boxShadow: "0 12px 30px -8px rgba(30,79,216,0.6)",
          }}
        >
          <LocalPrintshopRoundedIcon sx={{ color: "#fff", fontSize: 38 }} />
        </Box>
        <Typography variant="h3" sx={{ fontWeight: 800, letterSpacing: 2, color: "primary.dark" }}>
          PRINTEASE
        </Typography>
        <Typography variant="h6" color="text.secondary" sx={{ fontWeight: 500 }}>
          Enter 4 Digit PIN
        </Typography>
      </Stack>

      <Stack direction="row" spacing={2} justifyContent="center" onPaste={onPaste}>
        {digits.map((digit, index) => (
          <TextField
            key={index}
            inputRef={(el) => (inputRefs.current[index] = el)}
            value={digit}
            onChange={(e) => onDigitChange(index, e.target.value)}
            onKeyDown={(e) => onKeyDown(index, e)}
            disabled={verifying}
            inputMode="numeric"
            autoComplete="off"
            inputProps={{
              maxLength: 1,
              style: {
                textAlign: "center",
                fontSize: "2.25rem",
                fontWeight: 700,
                padding: "18px 0",
              },
            }}
            sx={{
              width: { xs: 56, sm: 68 },
              "& .MuiOutlinedInput-root": {
                borderRadius: 3,
                backgroundColor: "#F3F5FC",
              },
            }}
          />
        ))}
      </Stack>

      <Button
        fullWidth
        size="large"
        variant="contained"
        disabled={!isPinComplete || verifying}
        onClick={onVerify}
        sx={{
          py: 2,
          fontSize: "1.15rem",
          fontWeight: 700,
          letterSpacing: 1,
          boxShadow: "0 14px 30px -10px rgba(30,79,216,0.6)",
        }}
        startIcon={verifying ? null : <CheckCircleIcon />}
      >
        {verifying ? <CircularProgress size={26} color="inherit" /> : "VERIFY"}
      </Button>
    </Stack>
  );
}

function JobScreen({ printJob, printing, onPrint, onBack }) {
  const { file_name: fileName, page_count: pageCount, copies, total_amount: totalAmount, print_status: status } = printJob;

  return (
    <Stack spacing={4}>
      <Stack spacing={1} alignItems="center">
        <Box
          sx={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: "#EAF0FF",
          }}
        >
          <DescriptionRoundedIcon sx={{ color: "primary.main", fontSize: 34 }} />
        </Box>
        <Typography variant="h5" sx={{ fontWeight: 700, color: "primary.dark" }}>
          Print Job Details
        </Typography>
      </Stack>

      <Stack spacing={0} divider={<Divider flexItem />}>
        <DetailRow label="File Name" value={fileName} />
        <DetailRow label="Pages" value={pageCount} />
        <DetailRow label="Copies" value={copies} />
        <DetailRow label="Amount" value={`₹${totalAmount}`} />
        <DetailRow label="Status" value={<StatusChip status={status} />} raw />
      </Stack>

      <Stack spacing={1.5}>
        <Button
          fullWidth
          size="large"
          variant="contained"
          color="primary"
          disabled={printing}
          onClick={onPrint}
          startIcon={printing ? null : <PrintIcon sx={{ fontSize: 28 }} />}
          sx={{
            py: 2.25,
            fontSize: "1.3rem",
            fontWeight: 700,
            letterSpacing: 1,
            boxShadow: "0 14px 30px -10px rgba(30,79,216,0.6)",
          }}
        >
          {printing ? <CircularProgress size={28} color="inherit" /> : "PRINT"}
        </Button>

        <Button
          fullWidth
          size="medium"
          variant="outlined"
          color="inherit"
          disabled={printing}
          onClick={onBack}
          startIcon={<ArrowBackIcon />}
          sx={{
            py: 1.25,
            fontWeight: 600,
            borderRadius: 2,
            borderColor: "rgba(0, 0, 0, 0.23)",
          }}
        >
          Enter Different PIN
        </Button>
      </Stack>
    </Stack>
  );
}

function DetailRow({ label, value, raw }) {
  return (
    <Stack direction="row" justifyContent="space-between" alignItems="center" sx={{ py: 1.6 }}>
      <Typography variant="body1" color="text.secondary" sx={{ fontWeight: 500 }}>
        {label}
      </Typography>
      {raw ? value : <Typography variant="body1" sx={{ fontWeight: 700, color: "text.primary" }}>{value}</Typography>}
    </Stack>
  );
}

function StatusChip({ status }) {
  const isWaiting = status === "waiting";
  return (
    <Box
      sx={{
        px: 1.5,
        py: 0.5,
        borderRadius: 10,
        fontSize: "0.85rem",
        fontWeight: 700,
        textTransform: "uppercase",
        letterSpacing: 0.5,
        color: isWaiting ? "#8A6D00" : "#0F7A4E",
        backgroundColor: isWaiting ? "#FFF3CD" : "#E3F8EE",
      }}
    >
      {status}
    </Box>
  );
}

function SuccessScreen() {
  return (
    <Stack spacing={3} alignItems="center" sx={{ py: 3 }}>
      <Box
        sx={{
          width: 88,
          height: 88,
          borderRadius: "50%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          backgroundColor: "#E3F8EE",
        }}
      >
        <CheckCircleIcon sx={{ color: "#0F7A4E", fontSize: 56 }} />
      </Box>
      <Typography variant="h5" align="center" sx={{ fontWeight: 700, color: "#0F7A4E" }}>
        Printing Completed Successfully
      </Typography>
      <Typography variant="body2" color="text.secondary" align="center">
        Returning to PIN screen…
      </Typography>
    </Stack>
  );
}