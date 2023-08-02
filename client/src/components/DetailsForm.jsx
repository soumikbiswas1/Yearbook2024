import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { BranchData } from "./constants/BranchData";
import { clubs, studentYear } from "./constants";
import axios from "axios";
//import csvDataa from "../csvData";
import {
  Row,
  Col,
  Spinner,
  Button,
  Toast,
  ToastContainer,
} from "react-bootstrap";
import "./DetailsForm.css";
import { Form as BootstrapForm } from "react-bootstrap";
import { Form, Field, FieldArray, Formik } from "formik";
import * as yup from "yup";
import Papa from "papaparse";

const phoneRegExp =
  /^((\\+[1-9]{1,4}[ \\-]*)|(\\([0-9]{2,3}\\)[ \\-]*)|([0-9]{2,4})[ \\-]*)*?[0-9]{3,4}?[ \\-]*[0-9]{3,4}?$/;
const emojiRegex =
  /[\u{1f300}-\u{1f5ff}\u{1f900}-\u{1f9ff}\u{1f600}-\u{1f64f}\u{1f680}-\u{1f6ff}\u{2600}-\u{26ff}\u{2700}-\u{27bf}\u{1f1e6}-\u{1f1ff}\u{1f191}-\u{1f251}\u{1f004}\u{1f0cf}\u{1f170}-\u{1f171}\u{1f17e}-\u{1f17f}\u{1f18e}\u{3030}\u{2b50}\u{2b55}\u{2934}-\u{2935}\u{2b05}-\u{2b07}\u{2b1b}-\u{2b1c}\u{3297}\u{3299}\u{303d}\u{00a9}\u{00ae}\u{2122}\u{23f3}\u{24c2}\u{23e9}-\u{23ef}\u{25b6}\u{23f8}-\u{23fa}]/gu;
const englishChractersRegex =
  /^[ ~`!@#$%^&*()_+=[\]\{}|;':,.\/<>?a-zA-Z0-9-]+$/;

const requiredErrorMessage = "This field is required";
const emailErrorMessage = "This email id is invalid";
const phoneErrorMessage = "This phone number is invalid";
const phoneLengthErrorMessage = "This phone number can only be 10 characters";
const quoteErrorMessage = "Quote can only be 80 characters long";
const duplicateErrorMessage = "Duplicate club entries found !";
const requestTimeOutErrorMessage =
  "Request Timed out! Please check your internet connection or please contact us if the issue persists.";
const imageSizeErrorMessage = "Image size cannot be greater than 5MB";
const emojiErrorMessage = "This field cannot contain an emoji";
const doubleQuotesErrorMessage = 'This field cannot contain double quotes(" ")';
const englishCharactersErrorMessage =
  "This field can only contain English alphabets(a-z,A-Z),numbers(0-9) and special characters( ~`!@#$%^&*()_+=[]{}|;':,./<>?- )";

yup.addMethod(yup.array, "distinctEntries", function (errorMessage) {
  return this.test(`test-distinct-entries`, errorMessage, function (value) {
    const { path, createError } = this;

    return (
      [...new Set(value)].length === value.length ||
      createError({ path, message: errorMessage })
    );
  });
});

yup.addMethod(yup.string, "maxImageSize", function (errorMessage) {
  return this.test(`test-max-image-size`, errorMessage, function (value) {
    const { path, createError } = this;

    const finalLength = value ? value.length : 0;

    return (
      finalLength <= 7 * 1024 * 1024 ||
      createError({ path, message: errorMessage })
    );
  });
});

yup.addMethod(yup.string, "checkNoEmojis", function (errorMessage) {
  return this.test(`test-emoji-presence`, errorMessage, function (value) {
    const { path, createError } = this;

    return (
      !emojiRegex.test(value) || createError({ path, message: errorMessage })
    );
  });
});

yup.addMethod(yup.string, "checkNoDoubleQuotes", function (errorMessage) {
  return this.test(
    `test-double-quote-presence`,
    errorMessage,
    function (value) {
      const { path, createError } = this;

      console.log(value);

      return (
        (value ? !value.includes(`"`) : 1) ||
        createError({ path, message: errorMessage })
      );
    }
  );
});

const validationSchema = yup.object().shape({
  name: yup
    .string()
    .required(requiredErrorMessage)
    .checkNoEmojis(emojiErrorMessage)
    .matches(englishChractersRegex, englishCharactersErrorMessage),
  nickname: yup
    .string()
    .required(requiredErrorMessage)
    .checkNoEmojis(emojiErrorMessage)
    .matches(englishChractersRegex, englishCharactersErrorMessage),
  department: yup.string().required(requiredErrorMessage),
  rollNumber: yup.string().required(requiredErrorMessage),
  email: yup.string().required(requiredErrorMessage).email(emailErrorMessage),
  phone: yup
    .string()
    .required(requiredErrorMessage)
    .matches(phoneRegExp, phoneErrorMessage)
    .min(10, phoneLengthErrorMessage)
    .max(10, phoneLengthErrorMessage),
  image: yup
    .string()
    .required(requiredErrorMessage)
    .maxImageSize(imageSizeErrorMessage),
  clubs: yup.array().distinctEntries(duplicateErrorMessage),
  wing: yup
    .string()
    .checkNoEmojis(emojiErrorMessage)
    .checkNoDoubleQuotes(doubleQuotesErrorMessage)
    .matches(englishChractersRegex, englishCharactersErrorMessage),
  quote: yup
    .string()
    .max(80, quoteErrorMessage)
    .checkNoEmojis(emojiErrorMessage)
    .checkNoDoubleQuotes(doubleQuotesErrorMessage)
    .matches(englishChractersRegex, englishCharactersErrorMessage),
});

export default function DetailsForm() {
  const { code } = useParams();
  const [csvData, setCsvData] = useState([]);
  const [selectedRollNumber, setSelectedRollNumber] = useState("");
  console.log(code);

  const department = BranchData[code].name;

  const csvDataa = `RollNo,NAME
20BT8001,SOUVIK PAL
20BT8002,ESHA MANDAL
20BT8003,DEBRUP CHAKRABORTY
20BT8004,RISHABH RANJAN
20BT8007,AGNILA SAHA
20BT8008,ADARSHA GHOSH
20BT8009,GADDAM YASWANTH
20BT8010,TRIJIT RANA
20BT8011,BIKKINA SREE SAI SWETHA
20BT8012,JAHID HOSSAIN
20BT8013,TASNEEM FATMA
20BT8014,SHREYA HALDAR
20BT8015,SOMPRANSHU KARAK
20BT8016,PRATIVA SAHU
20BT8017,SWAGATALAXMI DATTA
20BT8018,SHIPRA PANDEY
20BT8019,APURBA DEBNATH
20BT8021,DHRUV PANT
20BT8022,SOURAV PAUL
20BT8023,MINKIKAR SAINATH SANJAY
20BT8024,BISHAL SAMANTA
20BT8025,SANKALP MISHRA
20BT8026,DIVYANSHU KUMAR RAM
20BT8027,PASUPULETI LAKSHMI SAHITHI
20BT8028,ASHISH RAJ
20BT8029,THOLKAPPIAN R
20BT8030,RAMISA AKHTER
20BT8031,VELAMKAYALA VENKATA SIVA AKHILESH
20BT8032,SNEHASIS PRADHAN
20BT8033,NABENDU DAS
20BT8034,VANKAYALAPATI NAVEEN
20BT8035,ARKADEEP GHOSH
20BT8036,DEEPENDRA SINGH
20BT8037,PALASH MONDAL
20BT8038,AMIT KUMAR
20BT8039,SANKARAPU SWETHA SREE
20BT8040,DAMAROUTHU SAI NEELIMA
20BT8041,DEBOJYOTI JANA
20BT8042,SURAJ PRASAD
20BT8043,BANOTHU SAI  PRIYA
20BT8045,KALYAN KUMAR CHOUBEY
20BT8046,RITESH RAJ SHARMA
20BT8048,SHIVAM KUMAR
20BT8049,YATHAM PRAVEEN
20BT8050,SUBHA GHORAI
20BT8051,MD ADNAN HUSSAIN
20BT8052,PARVATHANENI ESWAR RATNAGIRI
20BT8054,HARSHIKA TIWARI
20BT8055,BIHAN SAHA
20BT8058,PANEM.CHANDRASHEKAR
20BT8059,SURAJ HALDER
20BT8060,ANIKET CHATTERJEE
20BT8062,SHAHIL KUMAR
20BT8063,SUBHAM MOULICK
20BT8065,KATRAVATH NAVEEN NAIK
20BT8066,TARUMOY DAS
20BT8067,VISHAL KUMAR
20BT8068,DIYA SUTAR
20BT1002,RANAJAY DUTTA
20BT1003,SAYAN HALDER
20BT1005,GAURAV PATEL
20CE8001,AMANDEEP KUMAR
20CE8002,SOURAV PAUL
20CE8003,ADITYA RAJ GAUTAM
20CE8004,POLAMURI NITIN
20CE8005,AVOY BARUA
20CE8006,SIDDHARTHA CHAKRABORTY
20CE8007,HRIDIKALPA DAS
20CE8008,ANKIT ANAND
20CE8009,PRITASMI BHATTACHARYYA
20CE8010,DARA MOUNIKA SAI PRIYA
20CE8011,AASHISH KUMAR SAH
20CE8012,DEBARGHYA ROY
20CE8013,SUDIPTA  BISWAS
20CE8014,VIPUL KUMAR
20CE8015,MANAK MODGALYA
20CE8016,NIKITA KUMARI
20CE8017,AYANIKA BANERJEE
20CE8018,RAUSHAN KUMAR
20CE8019,PRAKASH PRASAD
20CE8020,AMARTYO KUMAR CHATTERJEE
20CE8021,ROSHAN KUMAR
20CE8022,ADITYA KUMAR YADAV
20CE8023,PAWAN PRATAP SINGH CHAUHAN
20CE8024,ASHISH KUMAR MEENA
20CE8025,VISHAL PANDEY
20CE8026,MEDINI MOHAN DOLEY
20CE8027,SUBHRAJYOTI BISWAS
20CE8028,SHRADDHA MANDAL
20CE8029,ABHILASH MANDAL
20CE8030,ARINDAM MANDAL
20CE8031,PRASHANT SHUKLA
20CE8032,RUPAM MANDAL
20CE8033,ANUMALA TARUNSAIKUMAR
20CE8034,VAIBHAV KUMAR
20CE8035,ARITRO GHOSH
20CE8036,PAPPALA UMA MAHESWARA RAO
20CE8037,ANUSHKA RAJ
20CE8038,URLANA LIKHITA
20CE8039,CHOKKAPU YASWANTH NAIDU
20CE8040,KANAJAM PRANEETH
20CE8041,PIYUSH SENGAR
20CE8042,ANKIT PRASAD
20CE8043,RASPUTH NIVETHA
20CE8044,THATHVIIKA MEDA
20CE8046,SURAJ CHOWDHARY
20CE8047,UTKARSH ANAND
20CE8048,NEHA KARMAKAR
20CE8049,SUDIP MONDAL
20CE8050,BODDU HOTHRIK
20CE8051,SUNDARAM SINGH
20CE8052,RITA MAHATO
20CE8054,KINTALI ANISHA
20CE8056,NITISH KUMAR GUPTA
20CE8057,TUSHAR
20CE8059,PRAVEEN
20CE8060,ADITYA ROY CHOWDHURY
20CE8061,BHUKYA ANUSHA
20CE8062,GOURISH MAITRA
20CE8063,SALADI SAI VENKATA DURGA HEMANTH
20CE8065,MD NASIR
20CE8066,VISHNU RAJ
20CE8067,PASUPULETI NIKITHA
20CE8068,TITAS CHAKRABORTY
20CE8069,SUVVARI INDUMATHI
20CE8070,BODDU HARIKA
20CE8072,RAHUL KUMAR
20CE8073,PRATHI SAI DURGA BHAVANI
20CE8074,NEELADRI DHAR
20CE8075,PILLI HEMANTH ABHISHEK CHOWDA
20CE8076,GARA VAMSI
20CE8078,SUDHEER KUMAR GURI
20CE8079,SUMAN HEMRAM
20CH8001,DINCHEN TAMANG
20CH8002,AYAN SIL
20CH8003,SHOUNAK HALDAR
20CH8004,SWARNALIM SONOWAL
20CH8005,SOURAV KARMAKAR
20CH8006,ISHAN GUPTA
20CH8007,RONIT JAISWAL
20CH8008,SHIVENDRA SINGH
20CH8009,DARAVATH THARUN
20CH8010,KOUSHIK SARDAR
20CH8011,ANUPAM DEY
20CH8012,SHREYA SADHUKHAN
20CH8013,SWARNALI SAHA
20CH8014,ANINDYA PAUL
20CH8015,NUNAVATH VENKANNA
20CH8016,DEVESH KHER
20CH8017,SHARIM MUSTAFA
20CH8018,ASHISH KUMAR SINGH
20CH8019,SUJAAN MOOKHERJEE
20CH8020,SAUMYA
20CH8021,BAMMIDI TIRUMALA SAI
20CH8022,SUSHMITA NANDI
20CH8023,AYUSHI GUPTA
20CH8024,PRASHANT KUMAR SINGH
20CH8025,KINSHUK TOTLA
20CH8027,ABHISHEK SINGH SILAWAT
20CH8028,SABYASACHI BOSE
20CH8029,YUVRAJ AMAR
20CH8030,DEBJIT SHARMA
20CH8031,RAJKUMAR DAS
20CH8032,NEHA KUMARI
20CH8033,ANUP GHOSH
20CH8034,PRITAM MONDAL
20CH8035,ZESHAN HOSSAIN SARDAR
20CH8036,DIBYAJYOTI BARIK
20CH8038,KAUSHIK SARKAR
20CH8039,RIDDHI CHOWDHURY
20CH8040,AKSHAY KUMAR SINGH
20CH8041,SWARNAJIT DAS
20CH8042,DIVYANSHU KUSHWAHA
20CH8043,SAMAROHA GHOSH
20CH8045,SAYAK ACHARYA
20CH8046,RAHUL KASHYAP
20CH8047,PRATITI PRADHAN
20CH8048,ANAGHA NAGARAJAN
20CH8049,GARGI BISWAS
20CH8050,SAJID KHAN
20CH8051,R JYOTHSNA
20CH8052,ARNAB GHOSH
20CH8054,SHAILESH KUMAR YADAV
20CH8055,ADITYA MUKHERJEE
20CH8056,SUMIT SINGH
20CH8057,SNEHIL SEN
20CH8058,DEVANSH PATEL
20CH8059,ABHIK AGUAN
20CH8060,RACHITA PANDEY
20CH8061,BHANDARE SIDDHANT ASURAJ
20CH8062,MEHULEE PATRA
20CH8063,B PRUDVI RAJ
20CH8064,"KOTHAMARAM VENKATA SAI ASHOK
VARDHAN REDDY"
20CH8065,AMIT VISHWAKARMA
20CH8066,ANUJ KUSHWAHA
20CH8067,SABYASACHI PRADHAN
20CH8068,SURAJ GUPTA
20CH8069,SANGHITA GHOSH
20CH8073,GUNTURI RITHWIK VARMA
20CH8074,MATTA PHANEENDRA SATYA SUSHANTH
20CH8075,DEV BARDHAN SINGH
20CH8076,ANISH JOHN
20CH1001,N SAI DINESH
20CH1002,SUSHANTA RAJWAR
20CH1003,AMARTYA GARAI
20CH1004,JELLA RAJESH
20CH1005,CHHAVI SHARMA
20CS8001,PRANNOY CHAKRABORTY
20CS8002,RITABRATA DAS
20CS8003,SHUBHABRATA GHOSH
20CS8004,MANISH KUMAR SHARMA
20CS8005,SUBHADEEP BISWAS
20CS8006,AMOOL KULDIYA
20CS8007,NAVIN KUMAR YADAV
20CS8008,ARCHISHMAN DAS
20CS8009,DHIRAJ KUMAR
20CS8010,SANKHADIP BERA
20CS8011,PAWAN KUMAR PANDIT
20CS8012,DEBAPRIYA SAHA
20CS8013,ANURAG MISHRA
20CS8014,AKSHAT KUMAR SAH
20CS8015,SAURAV KUMAR
20CS8016,RAHUL RANJAN
20CS8017,TANMOY CHATTERJEE
20CS8018,DIPTANGSHU DEY
20CS8019,SHREYA LAMA
20CS8020,KELOTHU RAHUL
20CS8021,NIRAJ KUMAR
20CS8022,SHREYA MONDAL
20CS8023,SUPRATIM DEY
20CS8024,SAYANTANI KARMAKAR
20CS8025,NILASHIS MUKHERJEE
20CS8026,PRALAY MONDAL
20CS8027,UDAYAN MUKHERJEE
20CS8028,ADITYA GHOSH
20CS8029,MOUMITA SEN
20CS8030,MEDAPATI RAJESH
20CS8031,MANISH KUMAR SINGH
20CS8032,SHRUTI SINGH
20CS8033,ADITYA TULSIYAN
20CS8034,JAMMIGUMPULA SAI SRIHARSHA
20CS8035,PURUSHOTAM KUMAR
20CS8036,K.ABHISHEK KRISHNA
20CS8037,RAKESH RAMAN
20CS8038,SAHIL KUMAR
20CS8039,RICK SARKAR
20CS8040,JOYRAJ LONGJAM
20CS8041,SALEHA NAZREEN
20CS8042,HARSH GUHA
20CS8044,ANMOL SHARMA
20CS8045,PARICHAY DUTTA
20CS8046,RAKESH KUMAR
20CS8047,ASRAF ALI
20CS8048,ROHITASHWA PAREEK
20CS8049,SUDDHASIL CHATTERJEE
20CS8050,UTTAM KUMAR
20CS8051,SHREYAS MISHRA
20CS8052,DURBAR CHAKRABORTY
20CS8053,SUBHAM MANDAL
20CS8055,SAGARIKA SAHANA
20CS8056,NOMULA VIJAY
20CS8057,RIYA ORANG
20CS8058,ARUNOPAL CHAKRABORTY
20CS8059,SHARMISTHA KARMAKAR
20CS8060,SUBHA DEY
20CS8062,OLLALA SUSHMA SWARAJ
20CS8063,AKSHAY A BAIJU
20CS8065,ROMIJUL LASKAR
20CS8066,SINDHU SINGH
20CS8067,ASISH BAURI
20CS8068,NISHITA KUMARI
20CS8070,BEERAVALLI VENUGOPAL REDDY
20CS8071,ANURAG SARKAR
20CS8072,PABITRA SENAPATI
20CS8073,KAUSHAL BAID
20CS8074,SATWIK MOHANTY
20CS8075,RUCHIKA SHAW
20CS8076,TOKALA POOJITHA
20CS8077,PURVI BINANI
20CS8078,VIBHASH KUMAR
20CS8079,KHUSHI KUMARI
20CS8080,RAJU KUMAR
20CS8081,TIRUMALASETTY YUVA SHANKAR
20CS8082,SAHIL GUPTA
20CS8083,APURVA JYOTI PAUL
20CS8084,ARITRA MANDAL
20CS8085,MD SHAFIULLAH QURAISHI
20CS8086,RAVI KANT SINGH
20CS8087,YUG SONI
20CS8088,SURAJ SHAW
20CS8089,NAKKINA SANTOSHDEEPAK
20CS8090,AKASHDEEP SINGH
20CS8091,ANIRBAN GAYEN
20CS8092,PRATYUSH VERMA
20CS8093,RACHARLA NEERAJ KOUSIL
20CS8094,CHOLLA SANGHA MITHRA
20CS8095,HIREN MAHALI
20CS8096,YOGENDRA PRATAP SINGH
20CS8097,AMARJIT GHOSH
20CS8098,SAYANTAN DHARA
20CS8099,SWASTIK SARKAR
20CS8100,SUMIT KUMAR SAH
20CS8101,SAKET SUMAN
20CS8102,KRITI KUMARI
20CS8103,GUNJA SINGH
20CS8104,GANDEPALLI AJAY KAUSHIK
20CS8105,ABHAY PRATAP SINGH
20CS8106,DIKSHITA MAJUMDAR
20CS8107,MACHANPALLY ARCHANA
20CS8108,GUMMADI SRI HARSHITHA
20CS8109,VENU CHOUDHARY
20CS8111,ABHISHEK KUMAR GAUTAM
20CS8112,ARYA SAH
20CS8113,MADHUMITA BHATTACHARJEE
20CS8114,SILLI AASHIQ
20CS8115,SURAVARAM AKSHAYA REDDY
20CS8116,AMARTYA RAJ
20CS8117,AKASH CHOKHANI
20CS8118,AHELI CHAKRABARTI
20CS8119,ROMASHA GUIN
20CS8120,VEDIKA AGRAWAL
20CS8121,ANUBHAV MANDAL
20CS8122,NELOY DEB
20CS8123,SHAKTI SHANKAR KARMAKAR
20CS8124,ABONTI ROY CHOWDHURY
20CS8125,MD. ASHRAFUL ALAM
20CS8126,PRATYUSH DAS
20CS8127,RAUSHAN KUMAR GUPTA
20CS8128,JAY GUPTA
20CS8129,MEKA VAMSI DATH
20CS8130,DASARI NITIN TEJA
20CS8131,UPPALAPATI HARI KRISHNA SAI
20CS8132,BINGI VINAY
20CS8133,SAPPA SABHARISH
20CS8135,MAYANK THAKUR
20CS8137,GIRI AARYAN RUPENDER
20CS8138,KUSUMANCHI SRI AKARSH
20CS8139,SONAL KUMARI
20CS8140,ANURAG SHARMA
20CS8141,YENDLURI MOUNIKA BRAHMANI
20CS8142,PASUMARTHI PRIYA
20CS8143,GURALA RISHWITH REDDY
20CS8144,NITIN SHYAM GUPTA
20CS8145,MADAGALA PRASANNA PAUL
20CS8146,POLAKA VENKATA SAI BHAVANA REDDY
20CS8147,ADITI SINGH
20CS8148,AJINKYA KALE
20CS8149,KONDETI NIKHIL
20CS8150,SURANJAN DAS
20CS8151,AYUSHI MEENA
20CS8152,SANKALP GARG
20CS8153,NADELLA SREE TEJA
20CS8154,REPALLE PURNA VASANTH
20CS8155,SAMHITHA KONDETI
20CS8156,VISHAL SHARMA
20CS8157,NITESH CHOUDHARY
20CS8158,RUDRADITYA JALAN
20CS8159,MANDAVALLI LAKSHMI SAI POOJITHA
20CS8160,KATURI KIRITI
20CS8161,SHUBHAM MUNDHRA
20CS8162,RONGALI NAVYA SRI
20CS8163,KISHAN RAJ
20CS8164,VARANDEEP SAHOTA
20CS8165,DIPAK PRASAD GUPTA
20CS8166,HIMANSHU KHAITAN
20CS8167,ABHIJIT KUMAR
20CS8168,MOHIT KUMAR
20CS8169,MUCHARLA VENKATA SUHAS
20CS8170,BHUKYA NITHIN RATHOD
20CS8171,KOTTAMIDDE MADHU HARSHITHA
20CS8172,ABHISHEK SINGH
20CS8173,JAKKAM HEMANTH
20CS8174,RAJEEV KUMAR
20CS8175,ARKAJYOTI GHOSH
20CS8176,THOTA MOHAN REDDY
20CS8177,MURUGUDU D S S S SAI RAGHAVA
20CS8178,SATYAM SINGH RAJPUT
20CS8179,KUSHALAVA REDDY JALA
20CS8180,SAI DEEPAK VARALASETTY
20CS8181,KOTA SAI NITHIN
20CS8182,MALAVATH SHEKAR
20CS8183,MUDUMBA SRI VARENYA
20CS8184,RAJIV RANJAN
20CS8185,SAYAN MONDAL
20CS8186,ARCHIT LALL
20CS8187,BONDA SRI VENKATA DHANUSH
20CS8188,SUMAN DAS
20CS8191,SABBELLA SUDHARSHAN REDDY
20CS8192,KOUSHIK KURUVA
20CS8193,DANDAMUDI SATYA GOWTHAM
20CS8195,PRIYANSHU KUMAR SINGH
20CS8196,ROHIT YADAV
20CS8197,DURANTA DURBAAR VISHAL SAHA
20CS8198,AKASH BAHADUR SINGH
20CS8199,SHASHANK SHEKHAR
20CS8200,NITIN KUSHWAHA
20CS8201,TUSHAR YADAV
20EC8001,JYOTIRMOY SINHA
20EC8002,SANDEEP VERMA
20EC8003,SUBHAJIT DEY
20EC8004,ABIR KUMAR MANNA
20EC8005,ARKAPRAVA MANNA
20EC8006,MARSHAL MARDI
20EC8007,SREEMOYEE SADHUKHAN
20EC8008,AKASH RAJ
20EC8009,MD FARHAN REZA
20EC8010,SUVAM BHATTACHARYA
20EC8011,BODHISATTWA DAS
20EC8012,GARGI BANERJEE
20EC8013,SUDHANSHU KUMAR SINHA
20EC8014,DIBYENDU MONDAL
20EC8015,SANAPALA VISHNU PRIYA
20EC8016,MRIGANKA MONDAL
20EC8017,SAYANTAN TALUKDAR
20EC8018,ATUL KUMAR KHARWAR
20EC8019,OM JAISWAL
20EC8020,PIYUSH KUMAR
20EC8021,ISHIKA BHANIRAMKA
20EC8022,TELAGAMSETTI SRI SAI RAM SAGAR
20EC8023,MD MANZER ALAM
20EC8024,RADA YASWANTH KUMAR
20EC8025,BIKRAMJOY CHATTERJEE
20EC8026,SOUMYAJIT MANNA
20EC8027,SUMAN MONDAL
20EC8028,SONIYA BAGDI
20EC8029,MUSUGU KAVYA
20EC8030,SHUBHRADIP SARKAR
20EC8031,DHRUBA JYOTI DEBNATH
20EC8032,SAYAN HANSDA
20EC8033,ARGHYADEEP DAS
20EC8034,MANISHA KUMARI
20EC8035,SAMARPAN GHOSH
20EC8036,GOLLAMUDI VENKATA SAI KARTHIK
20EC8037,B TARUN KUMAR
20EC8038,ABBAVARAM CHAITHANYA KUMAR REDDY
20EC8039,SOUMILI KUNDU
20EC8040,KUMKUM RAY
20EC8041,SWAGATA DAS
20EC8042,UPPALA RAHUL
20EC8043,RAMASHIS BHATTACHARYA
20EC8044,SUSHANT SINGH
20EC8045,RAMAGALLA SATISH KUMAR
20EC8046,ADITI DAS
20EC8047,GURUMPALLI HARSHINI
20EC8048,MOULI GHOSH
20EC8049,VANGALAPUDI ABHILASH
20EC8050,MD ADNAN JAWED
20EC8051,MALANI LAXMIKANTH
20EC8052,SURIMILLI LAKSHMI KIRAN KUMAR
20EC8053,BHIMAVARAPU VENKATA NITHIN REDDY
20EC8054,KUSHAL SARDA
20EC8055,BANDI LAKSHMI SAHITHI
20EC8056,ABHISHEK KUMAR SAH
20EC8057,MOHAMMAD RAFIVULLA
20EC8058,SAMIR PAUL
20EC8059,TALLA RAGHU RAM REDDY
20EC8060,BANIK ROY MANDAL
20EC8061,SOURABH KUMAR DEO
20EC8062,SRIJAN MAJUMDAR
20EC8063,NIRAJ KUMAR MUKHI
20EC8064,KARAPUREDDY JESWANTH REDDY
20EC8065,MUDDADA TEJASWINI
20EC8066,ADITI JAISWAL
20EC8067,SHUBHAM SAMANTA
20EC8068,ATHARVA VERMA
20EC8069,KUMARI NATALYA
20EC8070,G GIREESH VENKAT REDDY
20EC8071,ABHISHEK ANAND
20EC8072,KASI REDDY VYSHNAVI
20EC8073,AYUSH RAY
20EC8074,PEDIREDLA DURGA VENKATA DIKSHITHA
20EC8075,NAGADESI SUDEEVEN KUMAR
20EC8076,YENNA HARSHITHA
20EC8077,KADARI KRUTHIK
20EC8078,VELIDINENI ABHIRAM
20EC8079,SUJAL GUPTA
20EC8080,NANCY AGARWAL
20EC8081,AMIT KUMAR BERA
20EC8082,NEMILI UDAY KUMAR
20EC8083,KUMARI MOHINI DHARAMDAS HURRE
20EC8084,KANNA AKSHAY
20EC8085,AKASH KUMAR BANERJEE
20EC8086,ANADASU GOVINDA RAJU
20EC8087,PALADUGU SAI VINEETH
20EC8088,BORREDDY SHASHANK
20EC8089,JAMI JAYANTH KRISHNA
20EC8090,JAMJAM BHANU NAGA SATYA SAI KARTIC
20EC8091,AMARA JAICHANDRA
20EC8092,MAYUKH NANDI
20EC8093,SAGNIK MONDAL
20EC8094,MOINAK BANERJEE
20EC8096,ARUNAVA SARDAR
20EC8097,JEERU MANOJ KUMAR
20EC8098,ABHISHEKH SINGH
20EE8001,SHYAMSUNDAR DAS
20EE8002,DIPTY SAHA
20EE8003,VED PRAKASH
20EE8004,SUBHRAJIT MAHANTI
20EE8005,ABHRANIL DAS
20EE8006,VISHAL SINGH JADAUN
20EE8007,EPSHITA CHAKRAVARTY
20EE8008,SUDARSAN PANDA
20EE8009,CHANDAN KUMAR SHAW
20EE8010,ABHISHEK HEMBRAM
20EE8011,SUDIP MAHATO
20EE8012,PRONITA LAKRA
20EE8013,ANKUR PATEL
20EE8014,HIMANSHU TIWARI
20EE8015,ANWESHA BISWAS
20EE8016,ARYAN RAJ
20EE8017,PRIYANSHU BURMAN
20EE8018,MANEESH
20EE8019,SAIKAT LAYEK
20EE8020,ABHIJEET KUMAR
20EE8021,TULA VAMSI DHEERAJ
20EE8022,CHAMALLAMUDI KAVYASREE
20EE8023,DEBJIT MAJI
20EE8024,DIPRANJAN DEY
20EE8025,JAYASHREE DAS
20EE8026,MORA SRINIVAS
20EE8027,PEDDINTI RUCHITHA
20EE8028,ATRAYEE CHATTERJEE
20EE8029,DEBASMITA DAS
20EE8031,SAYANTI NAYAK
20EE8032,ABHINABA DUTTA
20EE8033,KESHAV GOYAL
20EE8034,SUBHRODIP DEB
20EE8035,VANKUDOTH JAYANTH
20EE8036,VIPUL PODDAR
20EE8037,MUTHAVARAPU RAMAKANTH
20EE8038,MOVVA NIKHIL
20EE8039,SUBHRA SEN
20EE8040,NAVEEN S G
20EE8041,MANISH KUMAR
20EE8042,JAGARLAMUDI SAI
20EE8043,SASHI SHARMA
20EE8044,SHREYANSH TRIPATHI
20EE8045,GURRALA DILEEP KUMAR
20EE8046,TALLA JAHNAVI
20EE8047,TUSHAR
20EE8048,JHANSI KRISHNA KARU
20EE8049,LENKALA THIRUMAL REDDY
20EE8050,ARSH JAD
20EE8051,SOUHAM KARMAKAR
20EE8052,RISHITA SHAW
20EE8053,KARRI VARSHITH
20EE8054,SHUBHAM VATSAL
20EE8055,ARNAB KARAK
20EE8056,ASHUTOSH KUMAR SINGH RATHORE
20EE8057,AAISHIKI GHOSH
20EE8058,ALIK GHOSH
20EE8059,GOURAV DAS
20EE8060,UJWALA TRIPURANA
20EE8062,SOUNAK KUNDU
20EE8063,SOUVIK SHARMA
20EE8064,SUHENDU REWANI
20EE8065,BONDAPALLI PRAVEEN KUMAR
20EE8066,KARAN KUMAR SHAW
20EE8067,AKULA HIMA SRI
20EE8068,BISHAL SINGH
20EE8069,DEBPRAKASH DAS
20EE8070,GAJJI GOVINDA SWESHIKA
20EE8071,RAHUL KUMAR SAH
20EE8072,RUPAM MAITY
20EE8073,SANKALP MOHANTY
20EE8074,MARA PRABHAS REDDY
20EE8075,DEEKSHITA KANCHARLA
20EE8076,INDRANIL MAJEE
20EE8077,ABHISHEK KUMAR JHA
20EE8078,SHREOSEE MONDAL
20EE8079,SAURABH SINGH
20EE8080,SIMMA THANOJ KUMAR
20EE8081,PILLALA JAGADISH SAI KUMAR
20EE8082,MANGIPUDI SANJANA
20EE8083,AGRADWIP KARMAKAR
20EE8084,YENAMANDRA SAI AKSHITHA
20EE8085,"PASUPULETI VEERA VENKATA SUBBAIAH
SATVIK"
20EE8086,BANOTHU SRAVANTHI
20EE8087,YUVRAJ CHOUDHARY
20EE8088,DAMMU RAVI TEJA
20EE8089,POTNURU POORNESH
20EE8090,SAMRIDDH
20EE8091,SHUBHAM CHHANGANI
20EE8093,PALISETTI BHAGYA SREE
20EE8094,SOURAJIT PAL
20EE8096,PRAGADA VENKATA PRABHAS
20EE8097,GULBAHAR ANSARI
20EE8098,KAVITI AJIT
20EE8099,PRANIT NARESH
20EE8100,ASIF KHAN
20EE8101,AMIT KUMAR YADAV
20EE8102,SANDEEP SAHOO
20EE8103,RISHIKESH TIWARI
20ME8002,OM PRAKASH YADAV
20ME8003,DEBJYOTI GHOSH
20ME8004,SAYAN PATRA
20ME8005,PIYUSH PRATIK
20ME8006,MEHUL MENON
20ME8007,SUBHAM PAUL
20ME8008,KUNDAN KUMAR
20ME8009,SOUVIK DEY
20ME8010,BINAYAK DATTA ROY
20ME8011,KABITA HARIJAN
20ME8012,SANDEEP KUMAR JAISWAL
20ME8013,MAYANK MANI TRIPATHI
20ME8014,AKASH BACHHAR
20ME8015,SHUBHRONIL MONDAL
20ME8016,AYUSHI
20ME8017,SANDEEP KUMAR
20ME8018,SANKET SINGH
20ME8019,ADITYA KESHRI
20ME8020,YOGESH KUMAR
20ME8022,ADARSH ARYA
20ME8023,AKRITI KUMARI
20ME8024,CHENNA DEEPIKA
20ME8025,ANKIT VERMA
20ME8026,KORRA SANTHOSH KUMAR
20ME8027,RIYA CHOWDHURY
20ME8028,ASHWANI GOYAL
20ME8029,MD WASHIF RAZA
20ME8030,SAIKAT SARKAR
20ME8031,SREYA PRASAD
20ME8032,ANUPAM MAHATO
20ME8033,NAKKELLA RAMSAI
20ME8034,JOYITA MANDI
20ME8035,BRATATI DEY
20ME8036,JOYDEEP NANDI
20ME8037,MADDI VISHNU VARDHAN REDDY
20ME8038,SOURJODIPTO DAS
20ME8039,SOURAV BARUA
20ME8040,CHOGYAL LAMA
20ME8042,S SACHIDANANDA DORA
20ME8043,SUSANTA MANDI
20ME8044,ANKIT MANDAL
20ME8046,SAYAN DAS
20ME8047,BALJI VIVEK
20ME8048,CHINNARI CHANDRIKA
20ME8050,PRASUN KUMAR DAS
20ME8051,RAVI PRAKASH
20ME8052,SADIQUE AZAM
20ME8053,ABHISHEK HAZARIKA
20ME8054,NAVIN KUMAR PATHAK
20ME8055,RISHAV JHA
20ME8056,MANJARI JHA
20ME8057,DRISHITA NAG
20ME8058,SOUMYADEEP DHAR
20ME8059,ABHIJEET KUMAR SINGH
20ME8060,BOTLA TEJASWI
20ME8061,GUDEM ANANYA
20ME8062,ARPAN SARDAR
20ME8063,SHREYAN GHOSH
20ME8064,KHUSHI TRIVEDI
20ME8065,TUSHAR AGRAHARI
20ME8066,J SUBHASHREE
20ME8067,BHUKYA GOVIND
20ME8068,DEWANSH KUMAR GAURAV
20ME8069,NIMMAKA SUNIL
20ME8070,FARHAT JAHAN
20ME8071,KARTIKEY PANDEY
20ME8072,ABHINANDAN MANDAL
20ME8073,GUGULOTHU NAVEEN
20ME8074,PRAGNA BHARATI PAL
20ME8075,AYUSH JAISWAL
20ME8076,BOTCHA VENKATA PADMA POOJITHA
20ME8077,AMIT NAYAN
20ME8078,MUSTI SAATHWIKA
20ME8079,HASAN RAJA
20ME8080,ARNAB SADHU
20ME8081,ANKIT BHARTI
20ME8082,NIKITA ROY
20ME8083,ALOK SAGAR
20ME8084,YOGAMUNI PRAMOD BHUPATI
20ME8085,SAMBANGI SAI SANDEEP
20ME8086,RISHIV SAHU
20ME8087,ANSHU KUMAR TIWARI
20ME8088,JAGARAPU LOKESH
20ME8090,MOHIT HALDER
20ME8091,AKASH PRASAD
20ME8092,SRIJANA GHOSH
20ME8093,INTURI JAYAKANTH
20ME8094,JELLIDIMUDI KISHORE
20ME8095,INDRANI GHOSH
20ME8096,NITYANANDA DEY
20ME8098,SUBRATA MAJI
20ME8099,MALLUVALASA MADHU KIRAN
20ME8100,KUSHAGRA PRATAP SINGH
20ME8101,ANIRBAN MONDAL
20ME8102,PIYUSH RAJ
20ME8103,SUDIPTA TUDU
20ME8104,BODDAPALLI BHARGAVI
20ME8105,DOMMATA SHARVANI REDDY
20ME8106,SASWATA SARKAR
20ME8107,JAMI KRISHNA SAMEERA
20ME8108,ARKAMITO SEN
20ME8109,TARRA JEEVAN SAI KUMAR
20ME8110,PUSHPAL GHODASKAR
20ME8111,BOMMALATA GOWTHAM
20ME8112,ARITRA MANDAL
20ME8113,VANTEPAKA VISHAAL KOUSHIK
20ME8114,BISWANATH CHAKRABORTY
20ME8115,ZOYA AHMAD
20ME8116,DEBDYUTI DAS
20ME8117,BONANGI CHANDRA SEKHAR NAIDU
20ME8118,NIKHIL JAISWAL
20ME8119,SUNAY PAL
20ME8120,ABHIK MISRA
20ME8121,KESHAV RATHI
20ME8122,PRITAM BASAK
20ME8123,ADITYA NARAYAN DEY
20ME8124,RANIT DAS
20ME8125,SURAJ SAH
20ME8126,SUNNAM LAKSHMI PRASANNA
20ME8127,NAVLESH KUMAR
20ME8128,SOURAV RANJAN BISWAL
20ME8129,DUDEKULA MAHAMOOD SAMEER
20ME8130,VIVAN JHA
20ME8131,SATYAM YOGENDRA
20ME8132,DEBASMIT DEY
20ME8133,PRINCE SRIVASTAVA
20ME8134,POTHULA RADHIKA
20ME8135,ADDALA GOWTHAM
20ME8137,RONIT RAY
20ME8138,ANISH KUMAR
20ME8139,TAMMINENI RAJESH
20ME8141,ANITA SOREN
20ME8142,BANOTH KHANDESHWARI
20ME8143,MANISH GURJAR
20ME8144,SOUMAJJAL KUNDU
20ME8145,SAGARAPU C V SAI MANI KIRAN
20ME8146,SANKALPA DAS
20ME8147,SAMEER KUMAR RAI
20ME8148,SHIVANSHU BASU MALLICK
20ME8149,SUMIT YADAV
20ME8150,MINUKURI NISHANTH REDDY
20ME8151,AMBUJALAPU UMA SHANKAR
20ME8152,KUMPATLA PAVANI SANDHYA DURGA
20ME8153,MADIGA HARI KRISHNA
20ME8155,ANKON GHOSH
20ME8157,SREERAM UTTAM
20ME8158,ASHESH SAHA
20ME8159,SHUBHAM JANGIR
20ME8160,ARSHIA BISWAS
20ME8161,SUDESHNA SAHA
20ME8162,PREETHA CHAKRABORTY
20ME8163,SIDDHARTH RAJ
20ME8164,SUBHODEEP PAL
20ME8165,BUSETTY PAVAN KUMAR
20ME8166,NAGESH KUMAR CHAURASIA
20ME8167,DADI NAGA VENKATA SATYANARAYANA
20ME8168,HARSH SRIVASTAVA
20ME8170,PUSHPENDER SINGH
20ME8171,VAIBHAV OJHA
20ME8172,MAREEDU ASHA JYOTHI
20ME8173,BATHULA BALAJI SEETHARAM CHOWDARY
20ME8174,BHARAT KUMAR PAREEK
20ME8175,"GANDIKOTA SRINIVASA SAI RAMA
PRANEETH"
20ME8176,MOHAMMED ALI AHMED KHAN
20ME8177,SHAIK LATHEEF RAHAMAN
20ME8178,DOPPA USHA SHREE
20ME8179,ANTHYUSH MELLEMPUTI
20ME8181,SUDIPTO SWAR
20ME8184,ABHISHEK DAS
20ME8186,ADITYA KUMAR SINGH
20ME8187,RAJNISH KUMAR
20ME8188,ALAN KERKETTA
20ME8190,MIHIR SAHANI
20ME8191,SAURABH PANDEY
19ME8158,MOHD FAISAL
20MM8001,SHIVAM SHRIVASTAVA
20MM8002,NIVA BECK
20MM8003,NILADRI PAUL
20MM8004,PRAGYA CHAKRABORTY
20MM8005,SHRUTI SHARMA
20MM8006,ABHISHEK KUMAR
20MM8007,DIPAYAN MAHATO
20MM8008,ROHAN PAL
20MM8009,SUPRIYA MAHATO
20MM8010,DHARAMBIR KUMAR
20MM8012,HEMANTA KUMAR
20MM8014,TAPATI RAKSHIT
20MM8015,AKASHDEEP MAHATA
20MM8016,THUDUMU MERCY
20MM8017,ANURAG SHIVAM BANSFORE
20MM8019,ANKIT KUMAR DARA
20MM8020,SINGAMPALLI SAI ARAVIND
20MM8021,GARIMA SINGH
20MM8022,SUBHRANIL LAHA
20MM8023,VINAYAK SONI
20MM8024,PIYUSH KUMAR YADAV
20MM8025,ARPAN CHAKRABORTY
20MM8026,SANDIP GOLDAR
20MM8027,SHOBHIT KATIYAR
20MM8028,DEBAPRIYA DAS
20MM8029,SOMWRIK DUBEY
20MM8030,SANDIP KUMAR SHARMA
20MM8031,SWAPNANEEL DAS
20MM8032,MAHIDHARA CHANDRA KIRAN SAKETH
20MM8033,SOHAM NATH
20MM8034,G SRINIVAS
20MM8035,PRINCE YADAV
20MM8036,LITON ROY
20MM8038,SUDHANSHU SEKHAR PATNAIK
20MM8039,FARIA TARIQ
20MM8041,SATYENDRA KHEDAR
20MM8042,SOURABH KUMAR SINGH
20MM8043,SWAROOP BHANJA
20MM8044,RANJAN KUMAR YADAV
20MM8045,SAGNIK KHAN
20MM8046,RAJHRIT BANERJEE
20MM8048,PAPPU KOWSHIK
20MM8049,FERAZ RAB
20MM8050,PRIYANSHI SINGH
20MM8051,DEEP NARAYAN
20MM8052,SRIRAMAKAVACHAM SAI SRI VATHSA
20MM8054,NEEL KAMAL
20MM8055,ATHRAM BEERSHAV
20MM8056,VISHAL MISHRA
20MM8058,ANIRUDDHA MONDAL
20MM8059,PRANAV KUMAR
20MM8060,SAKSHI
20MM8061,NEHA TULSHYAN
20MM8062,KUMRAM SAI
20MM8063,ANKIT SARKAR
20MM8064,SURJADEEP GHOSH
20MM8065,KOTA GUNASEKHAR
20MM8067,PRATIBHA GOUDA
19CY1007,SAYAN SARKAR
20CY1003,VINAY KUMAR
20CY1004,DEVINA DEBNATH
20CY1005,PRADEEP KUMAR GOLLAPALLI
20CY1006,ANJALI KUMARI
20CY1009,AYYAPPAN R
20CY1010,SREETAMA DAS
20CY1011,ASHLESHA UPADHYAY
20CY1013,DURGESH MISHRA
20CY1014,ROHIT CHATTERJEE
20CY1015,PANKAJ KUMAR YADAV
`;

  useEffect(() => {
    Papa.parse(csvDataa, {
      delimiter: ",",
      //download: true,
      header: true,
      //dynamicTyping: true,
      skipEmptyLines: true,
      //newline: "",
      complete: (result) => {
        console.log(result);
        setCsvData(result.data);
      },
    });
  }, []);
  console.log("Data", csvData[0]);

  const handleRollNumberChange = (e, setFieldValue) => {
    const selectedRollNumber = e.target.value;
    console.log(selectedRollNumber);
    //setSelectedRollNumber(selectedRollNumber);

    // const selected = csvData.find(
    //   (item) => item.RollNo === selectedRollNumber
    // );
    const selected = csvData.find(
      (entry) => entry.RollNo === selectedRollNumber
    );
    if (selected) {
      const selectedName = selected.NAME;
      console.log(selectedName);
      setFieldValue("name", selectedName);
    }
    console.log(selected);
    setFieldValue("rollNumber", selectedRollNumber);
  };

  const getRollNumbers = () => {
    let rollNumbers = [];

    rollNumbers = rollNumbers.concat(BranchData[code].additionalRollNumbers);

    console.log(BranchData[code]);

    for (var i = BranchData[code].start; i <= BranchData[code].end; i++) {
      rollNumbers.push(`${studentYear}${BranchData[code].code}${i}`);
    }

    console.log(rollNumbers, BranchData[code].additionalRollNumbers);

    return rollNumbers;
  };

  const rollNumbers = getRollNumbers();
  const navigate = useNavigate();

  const [uploadingImage, setUploadingImage] = useState(false);
  const [show, setShow] = useState(0);
  const [error, setError] = useState(null);

  const toggleShow = () => setShow(!show);

  const initialValues = {
    name: "",
    nickname: "",
    department,
    rollNumber: rollNumbers[0],
    email: "",
    phone: "",
    image: "",
    clubs: [],
    quote: "",
    wing: "",
  };

  console.log(rollNumbers);

  const renderRollNumbers = () => {
    return rollNumbers.map((rollNumber) => {
      return (
        <option
          key={`${rollNumber}`}
          value={`${rollNumber}`}
        >{`${rollNumber}`}</option>
      );
    });
  };

  const renderClubOptions = () => {
    return clubs.map((club) => {
      return <option key={club} value={`${club}`}>{`${club}`}</option>;
    });
  };

  const handleFileUpload = (e, values, setValues) => {
    let reader = new FileReader();
    let file = e.target.files[0];

    reader.onloadend = () => {
      // console.log(reader.result);
      // field.onChange(e);

      setValues({
        ...values,
        image: reader.result,
      });
    };

    reader.readAsDataURL(file);
  };

  const uploadImage = async (image) => {
    const data = new FormData();
    data.append("file", image);
    data.append(
      "upload_preset",
      process.env.REACT_APP_CLOUDINARY_UPLOAD_PRESET
    );
    data.append("folder", process.env.REACT_APP_CLOUDINARY_UPLOAD_FOLDER);

    try {
      const response = await axios.post(process.env.REACT_APP_CLOUD_URL, data);

      console.log(response);

      if (!response.data.url)
        throw "Sorry, could not upload image.Please try again later.";

      return response.data.url;
    } catch (error) {
      console.log(error);

      if (error.code === "ERR_NETWORK") {
        throw requestTimeOutErrorMessage;
      }

      throw error.stringify();
    }
  };

  const renderErrorToast = () => {
    return (
      <>
        {/* <Button onClick={toggleShow} className="mb-2">
          Toggle Toast <strong>with</strong> Animation
        </Button> */}
        <Toast show={show} onClose={toggleShow} className="error-toast-main">
          <Toast.Header className="error-toast-header">
            <strong className="ms-auto text-center error-toast-header-text">
              Error
            </strong>
          </Toast.Header>
          <Toast.Body className="error-toast text-center">{error}</Toast.Body>
        </Toast>
      </>
    );
  };

  const checkIfAlreadyExists = async (rollNumber) => {
    try {
      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/check/${rollNumber}`
      );

      console.log("Check if exists:", response);

      if (response.data.error) throw response.data.error;
    } catch (error) {
      if (error.code === "ERR_NETWORK") {
        throw requestTimeOutErrorMessage;
      }

      throw error;
    }
  };

  const handleSubmit = async (values, setSubmitting) => {
    try {
      await checkIfAlreadyExists(values.rollNumber);

      let finalValues = { ...values };

      if (values.image) {
        setUploadingImage(1);
        const imageUrl = await uploadImage(values.image);
        setUploadingImage(0);
        console.log(values, imageUrl);
        finalValues = { ...values, image: imageUrl };
      }

      const response = await axios.post(
        `${process.env.REACT_APP_BACKEND_URL}/submit`,
        finalValues
      );

      if (response.data.success) {
        navigate("/submit");
      }

      throw response.data.error;
    } catch (error) {
      const errorMessage = error.toString();

      console.log(errorMessage);
      setShow(1);
      setError(errorMessage);
    }
    setSubmitting(false);
  };

  return (
    <div className="DetailsForm">
      <div style={{ color: "#808080", fontSize: "13px", marginTop: "5px" }}>
        <center>
          For any queries or information, contact Sagnik Khan (
          <a href="tel:8420074884">8420074884</a>) or Kaushal Baid (
          <a href="tel:7044666331">7044666331</a>).
        </center>
      </div>

      <Formik
        initialValues={initialValues}
        onSubmit={(values, { setSubmitting }) => {
          handleSubmit(values, setSubmitting);
        }}
        validationSchema={validationSchema}
      >
        {({ values, setValues, errors, touched, isSubmitting }) => (
          <Form className="contact100-form">
            <Field name="name">
              {({ field, form: { touched, errors }, meta }) => (
                <div className="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <span>
                        Full Name:
                        <h5 style={{ color: "red" }}>*</h5>
                      </span>
                    </span>
                    <input className="input100" type="text" {...field} />
                    <span className="error focus-input100"></span>
                  </div>
                  {errors.name && touched.name && (
                    <div className="error-message">{errors.name}</div>
                  )}
                </div>
              )}
            </Field>

            <Field name="nickname">
              {({ field, form: { touched, errors }, meta }) => (
                <div className="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <span>
                        Nick Name:
                        <h5 style={{ color: "red" }}>*</h5>
                      </span>
                    </span>
                    <input className="input100" type="text" {...field} />
                    <span className="error focus-input100"></span>
                  </div>
                  {errors.nickname && touched.nickname && (
                    <div className="error-message">{errors.nickname}</div>
                  )}
                </div>
              )}
            </Field>

            <Field name="department">
              {({ field, form: { touched, errors }, meta }) => (
                <div className="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <span>
                        Department:
                        <h5 style={{ color: "red" }}>*</h5>
                      </span>
                    </span>
                    <input
                      className="input100"
                      type="text"
                      {...field}
                      readOnly
                    />
                    <span className="focus-input100"></span>
                  </div>
                  {errors.department && touched.department && (
                    <div className="error-message">{errors.department}</div>
                  )}
                </div>
              )}
            </Field>

            <Field name="rollNumber">
              {({ field, form: { touched, errors, setFieldValue }, meta }) => (
                <div class="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      Roll No.
                      <h5 style={{ color: "red" }}>*</h5>
                    </span>

                    <select
                      className="input100"
                      name="rollNumber"
                      {...field}
                      onChange={(e) => handleRollNumberChange(e, setFieldValue)}
                    >
                      {renderRollNumbers()}
                    </select>
                    <span className="focus-input100"></span>
                  </div>
                  {errors.rollNumber && touched.rollNumber && (
                    <div className="error-message">{errors.rollNumber}</div>
                  )}
                </div>
              )}
            </Field>

            <Field name="email">
              {({ field, form: { touched, errors }, meta }) => (
                <div class="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <span>
                        Personal Email:
                        <h5 style={{ color: "red" }}>*</h5>
                      </span>
                    </span>
                    <input className="input100" type="text" {...field} />
                    <span className="focus-input100"></span>
                  </div>
                  {errors.email && touched.email && (
                    <div className="error-message">{errors.email}</div>
                  )}
                </div>
              )}
            </Field>

            <Field name="phone">
              {({ field, form: { touched, errors }, meta }) => (
                <div class="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <span>
                        Phone:
                        <h5 style={{ color: "red" }}>*</h5>
                      </span>
                    </span>
                    <input className="input100" type="text" {...field} />
                    <span className="focus-input100"></span>
                  </div>

                  {errors.phone && touched.phone && (
                    <div className="error-message">{errors.phone}</div>
                  )}
                </div>
              )}
            </Field>

            <Field name="image">
              {({ field, form: { touched, errors }, meta }) => {
                // console.log(errors.image, touched);

                return (
                  <div class="input-wrapper">
                    <div className="wrap-input100 validate-input photo-wrapper">
                      <span className="label-input100">Photo</span>

                      <BootstrapForm.Control
                        type="file"
                        name="photo"
                        accept="image/*"
                        onChange={(e) => {
                          handleFileUpload(e, values, setValues);
                        }}
                      />

                      {values.image ? (
                        <img id="photo-display" src={values.image} />
                      ) : null}

                      <span className="focus-input100"></span>
                    </div>

                    {errors.image && touched.image && (
                      <div className="error-message">{errors.image}</div>
                    )}
                  </div>
                );
              }}
            </Field>

            <FieldArray name="clubs">
              {(arrayHelpers) => (
                <div class="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <div>Club/</div>
                      <div>Team(s):</div>
                    </span>

                    <div class="d-grid gap-2">
                      <button
                        className="btn btn-success add-button"
                        type="button"
                        onClick={() => arrayHelpers.push(clubs[0])}
                      >
                        Add
                      </button>
                    </div>

                    {values.clubs && values.clubs.length > 0
                      ? values.clubs.map((friend, index) => (
                          <div key={index}>
                            <Row>
                              <Col xs={10}>
                                <Field
                                  className="input-wrapper"
                                  name={`clubs.${index}`}
                                >
                                  {({
                                    field,
                                    form: { touched, errors },
                                    meta,
                                  }) => (
                                    <div className="wrap-input100 club-options-render">
                                      <select
                                        className="input100"
                                        {...field}
                                        size="sm"
                                      >
                                        {renderClubOptions()}
                                      </select>
                                      <span className="focus-input100"></span>
                                    </div>
                                  )}
                                </Field>
                              </Col>
                              <Col>
                                <button
                                  type="button"
                                  class="btn-close"
                                  aria-label="Close"
                                  onClick={() => arrayHelpers.remove(index)}
                                ></button>
                              </Col>
                            </Row>

                            <span className="focus-input100"></span>
                          </div>
                        ))
                      : null}
                  </div>

                  {errors.clubs && (
                    <div className="error-message">{errors.clubs}</div>
                  )}
                </div>
              )}
            </FieldArray>

            <Field name="wing">
              {({ field, form: { touched, errors }, meta }) => (
                <div class="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <span>Wing:</span>
                    </span>
                    <input className="input100" type="text" {...field} />
                    <span className="focus-input100"></span>
                  </div>
                  {errors.wing && touched.wing && (
                    <div className="error-message">{errors.wing}</div>
                  )}
                </div>
              )}
            </Field>

            <Field name="quote">
              {({ field, form: { touched, errors }, meta }) => (
                <div class="input-wrapper">
                  <div className="wrap-input100">
                    <span className="label-input100">
                      <span>Quote:</span>
                    </span>
                    <input className="input100" type="text" {...field} />
                    <span className="focus-input100"></span>
                  </div>
                  {errors.quote && touched.quote && (
                    <div className="error-message">{errors.quote}</div>
                  )}
                </div>
              )}
            </Field>

            <div className="container-contact100-form-btn d-grid gap-2">
              {show ? renderErrorToast() : null}

              <button
                className="btn-block contact100-form-btn"
                disabled={isSubmitting}
                type="submit"
              >
                <span class="submit-wrapper">
                  {isSubmitting ? (
                    <>
                      {uploadingImage ? "Uploading Image..." : "Loading..."}
                      <span className="loading"></span>
                      <Spinner animation="border" variant="light" />
                    </>
                  ) : (
                    <>
                      Submit
                      <i
                        className="fa fa-long-arrow-right m-l-7"
                        aria-hidden="true"
                      ></i>
                    </>
                  )}
                </span>
              </button>
            </div>
          </Form>
        )}
      </Formik>

      <div id="dropDownSelect1"></div>
    </div>
  );
}
