import React, { useState, useEffect, useContext } from "react";
import { SettingsContext } from "../App";
import {
  Box,
  Typography,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Radio,
  RadioGroup,
  FormControlLabel,
  Button,
  Paper,
  Snackbar,
  Alert,
  TextField,
} from "@mui/material";
import axios from "axios";
import API_BASE_URL from "../apiConfig";

const StudentFacultyEvaluation = () => {
  const settings = useContext(SettingsContext);

  const [titleColor, setTitleColor] = useState("#000000");
  const [subtitleColor, setSubtitleColor] = useState("#555555");
  const [borderColor, setBorderColor] = useState("#000000");
  const [mainButtonColor, setMainButtonColor] = useState("#1976d2");
  const [subButtonColor, setSubButtonColor] = useState("#ffffff");   // ✅ NEW
  const [stepperColor, setStepperColor] = useState("#000000");       // ✅ NEW

  const [fetchedLogo, setFetchedLogo] = useState(null);
  const [companyName, setCompanyName] = useState("");
  const [shortTerm, setShortTerm] = useState("");
  const [campusAddress, setCampusAddress] = useState("");

  useEffect(() => {
    if (!settings) return;

    // 🎨 Colors
    if (settings.title_color) setTitleColor(settings.title_color);
    if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
    if (settings.border_color) setBorderColor(settings.border_color);
    if (settings.main_button_color) setMainButtonColor(settings.main_button_color);
    if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color);   // ✅ NEW
    if (settings.stepper_color) setStepperColor(settings.stepper_color);           // ✅ NEW

    // 🏫 Logo
    if (settings.logo_url) {
      setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);
    } else {
      setFetchedLogo(EaristLogo);
    }

    // 🏷️ School Information
    if (settings.company_name) setCompanyName(settings.company_name);
    if (settings.short_term) setShortTerm(settings.short_term);
    if (settings.campus_address) setCampusAddress(settings.campus_address);

  }, [settings]);


  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState("");
  const [snackbarSeverity, setSnackbarSeverity] = useState("success");

  const [userID, setUserID] = useState("");
  const [user, setUser] = useState("");
  const [userRole, setUserRole] = useState("");
  const [studentCourses, setStudentCourses] = useState([]);
  const [selectedCourse, setSelectedCourse] = useState("");
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [studentNumber, setStudentNumber] = useState("");

  useEffect(() => {
    if (!settings) return;

    if (settings.title_color) setTitleColor(settings.title_color);
    if (settings.subtitle_color) setSubtitleColor(settings.subtitle_color);
    if (settings.main_button_color) setMainButtonColor(settings.main_button_color);
    if (settings.sub_button_color) setSubButtonColor(settings.sub_button_color);
    if (settings.logo_url) setFetchedLogo(`${API_BASE_URL}${settings.logo_url}`);

    if (settings.company_name) setCompanyName(settings.company_name);
    if (settings.short_term) setShortTerm(settings.short_term);
    if (settings.campus_address) setCampusAddress(settings.campus_address);
  }, [settings]);

  // Check user session
  useEffect(() => {
    const storedUser = localStorage.getItem("email");
    const storedRole = localStorage.getItem("role");
    const storedID = localStorage.getItem("person_id");

    if (storedUser && storedRole && storedID) {
      setUser(storedUser);
      setUserRole(storedRole);
      setUserID(storedID);

      if (storedRole !== "student") {
        window.location.href = "/faculty_dashboard";
      } else {
        fetchCourseData(storedID);
        fetchQuestions();
      }
    } else {
      window.location.href = "/login";
    }
  }, []);

  const fetchQuestions = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/get_questions_for_evaluation`);
      setQuestions(response.data);
    } catch {
      showSnackbar("Failed to fetch questions", "error");
    }
  };

  const fetchCourseData = async (id) => {
    try {
      const res = await axios.get(`${API_BASE_URL}/api/student_course/${id}`);
      setStudentCourses(res.data);
      if (res.data.length > 0) setStudentNumber(res.data[0].student_number);
    } catch {
      console.log("No courses found");
    }
  };

  const handleSelectedCourse = (event) => setSelectedCourse(event.target.value);
  const handleAnswerChange = (question_id, value) =>
    setAnswers((prev) => ({ ...prev, [question_id]: value }));

  const selectedProfessor = studentCourses.find((prof) => prof.course_id === selectedCourse);

  const showSnackbar = (message, severity = "success") => {
    setSnackbarMessage(message);
    setSnackbarSeverity(severity);
    setSnackbarOpen(true);
  };

  const SaveEvaluation = async () => {
    if (!selectedProfessor) {
      showSnackbar("Please select a course before submitting.", "warning");
      return;
    }

    try {
      for (const [question_id, answer] of Object.entries(answers)) {
        await axios.post(`${API_BASE_URL}/api/student_evaluation`, {
          student_number: studentNumber,
          school_year_id: selectedProfessor.active_school_year_id,
          prof_id: selectedProfessor.prof_id,
          course_id: selectedProfessor.course_id,
          question_id,
          answer,
        });
      }
      showSnackbar("Evaluation submitted successfully!", "success");
      setAnswers({});
      setSelectedCourse("");
      fetchCourseData(userID);
    } catch {
      showSnackbar("Failed to save evaluation.", "error");
    }
  };

  // Disable right-click & dev tools
  document.addEventListener("contextmenu", (e) => e.preventDefault());
  document.addEventListener("keydown", (e) => {
    if (
      e.key === "F12" ||
      e.key === "F11" ||
      (e.ctrlKey && e.shiftKey && ["I", "J"].includes(e.key)) ||
      (e.ctrlKey && e.key === "U")
    ) {
      e.preventDefault();
      e.stopPropagation();
    }
  });

  return (
    <Box
      sx={{
        height: "calc(100vh - 150px)",
        overflowY: "auto",
        backgroundColor: "transparent",
        paddingRight: 3,
      }}
    >
      {/* Header */}
      <Box sx={{ mb: 4 }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: "bold",
            color: titleColor,
            fontSize: "36px",
            mb: 2, // spacing below the title
            textAlign: "left", // optional: center the title
          }}
        >
          FACULTY EVALUATION FORM
        </Typography>

        {/* Divider line */}
        <Box
          component="hr"
          sx={{
            border: "1px solid #ccc",
            width: "100%",
            mb: 3, // spacing below the line
          }}
        />
      </Box>


      {/* Course Selection */}
      <Paper
        sx={{
          p: 3,
          mb: 4,
          borderRadius: 3,
          boxShadow: 2,
          border: `2px solid ${borderColor}`,
        }}
      >
        <Typography variant="h6" sx={{ mb: 2, color: subtitleColor }}>
          Choose Course
        </Typography>

        {/* Course Selection */}
        <FormControl fullWidth sx={{ mb: 3 }}>
          <InputLabel>Select Course</InputLabel>
          <Select value={selectedCourse} onChange={handleSelectedCourse} label="Select Course">
            {studentCourses.map((prof) => (
              <MenuItem key={prof.course_id} value={prof.course_id}>
                <Box sx={{ display: "flex" }}>
                  <Typography sx={{ width: "50%", fontWeight: 500 }}>
                    {prof.course_code} - {prof.course_description}
                  </Typography>
              
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>

        {/* Selected Professor */}
        {selectedProfessor && (
          <TextField
            fullWidth
            label="Professor"
            value={`${selectedProfessor.fname} ${selectedProfessor.mname} ${selectedProfessor.lname}`}
            InputProps={{
              readOnly: true,
            }}
            sx={{ mb: 2 }}
          />
        )}
      </Paper>


      {/* Evaluation Questions */}
      {selectedProfessor && (
        <Box>
          {questions.map((q) => (
            <Paper
              key={q.question_id}
              sx={{
                p: 3,
                mb: 3,
                borderRadius: 3,
                boxShadow: 1,
                border: `2px solid ${borderColor}`,
                transition: "0.3s",
                "&:hover": { boxShadow: 4 },
              }}
            >
              <Typography variant="subtitle1" sx={{ fontWeight: "bold", mb: 1 }}>
                {q.question_description}
              </Typography>
              <RadioGroup
                row
                value={answers[q.question_id] || ""}
                onChange={(e) => handleAnswerChange(q.question_id, e.target.value)}
              >
                {[q.first_choice, q.second_choice, q.third_choice, q.fourth_choice, q.fifth_choice]
                  .filter(Boolean)
                  .map((choice, i) => (
                    <FormControlLabel key={i} value={choice} control={<Radio />} label={choice} />
                  ))}
              </RadioGroup>
            </Paper>
          ))}

          <Button
            variant="contained"
            sx={{
              bgcolor: mainButtonColor,
              color: subButtonColor,
              "&:hover": { bgcolor: titleColor },
              mt: 2,
            }}
            onClick={SaveEvaluation}
          >
            Submit Evaluation
          </Button>
        </Box>
      )}

      <Snackbar
        open={snackbarOpen}
        autoHideDuration={3000}
        onClose={() => setSnackbarOpen(false)}
        anchorOrigin={{ vertical: "top", horizontal: "center" }}
      >
        <Alert severity={snackbarSeverity} sx={{ width: "100%" }}>
          {snackbarMessage}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default StudentFacultyEvaluation;
