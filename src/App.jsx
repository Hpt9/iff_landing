import "./App.css";
import logo1 from "../public/logo1.svg";
import logo2 from "../public/logo2.svg";
import { FiSmartphone } from "react-icons/fi";

import { FaFacebookF } from "react-icons/fa";
import { FaInstagram } from "react-icons/fa";
import { FaYoutube } from "react-icons/fa";

function App() {
  return (
    <div>
      <div className="landing">
        <div className="desktop">
          <div className="desktop-left-finished">
            <div className="event-title">Son tədbir:</div>
            <div className="event-container">
              <div className="event-container-item">1 Oktyabr 2025 / 18:00-21:00</div>
            </div>
          </div>
          <img src={logo1} alt="logo" style={{width: "264px"}}/>
          <div className="desktop-right-next">
            <div className="event-title">Keçmiş tədbirlər:</div>
            <div className="event-container">
              <div className="event-container-item">1 Oktyabr 2025 / 18:00-21:00</div>
            </div>
          </div>
        </div>
        <div className="mobile">
          <img src={logo1} alt="logo" style={{width: "110px"}}/>
          <div className="mobile-left-finished">
            <div className="event-title">Son tədbir:</div>
            <div className="event-container">
              <div className="event-container-item">1 Oktyabr 2025 / 18:00-21:00</div>
            </div>
          </div>
          <div className="mobile-right-next">
            <div className="event-title">Keçmiş tədbirlər:</div>
            <div className="event-container">
              <div className="event-container-item">1 Oktyabr 2025 / 18:00-21:00</div>
            </div>
          </div>
        </div>
      </div>
      <div className="footer">
        <div className="footer-content">
          <div className="footer-content-left">
            <div className="footer-content-left-logo">
              <img src={logo2} alt="logo" />
            </div>
            <div className="footer-content-left-phone">
              <FiSmartphone className="icon" />

              <div>
                <p>Əlaqə saxlayın</p>
                <p>+994 51 634 85 96</p>
              </div>
            </div>
          </div>
          <div className="footer-content-right">
            <div className="footer-content-right-title">Əlaqə Saxlayın</div>
            <div className="footer-content-right-address-container">
              <div className="footer-content-right-address">
                <p>Tədbirin Ünvanı:</p>
                <p>Azərbaycan, Bakı şəhəri, Xocalı prospekti, İbis Hotel</p>
              </div>
              <div className="footer-content-right-icon-container">
                <div className="footer-content-right-icon">
                  <FaFacebookF className="icon" />
                </div>
                <div className="footer-content-right-icon">
                  <FaInstagram className="icon" />
                </div>
                <div className="footer-content-right-icon">
                  <FaYoutube className="icon" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div className="copyright">
        <p>Copyright © 2025 Bütün Hüquqlar Qorunur! Developed by UTD</p>
      </div>
    </div>
  );
}

export default App;
