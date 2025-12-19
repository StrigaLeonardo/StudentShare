// src/components/Dashboard/MojShare/MojShare.jsx
import React, { useState } from "react";
import { MdKeyboardArrowDown } from "react-icons/md";
import "./MojShare.css";

const MojShare = () => {
  const [showMainMenu, setShowMainMenu] = useState(false);
  const [showSortMenu, setShowSortMenu] = useState(false);

  const [sortBy, setSortBy] = useState("name"); // name | modified | myModified | myOpened
  const [sortDir, setSortDir] = useState("asc"); // asc | desc
  const [foldersPosition, setFoldersPosition] = useState("top"); // top | mixed

  // dummy data dok ne spojiš backend
  const files = [];

  return (
    <div className="mojshare-wrapper">
      {/* Header s naslovom i glavnim izbornikom */}
      <div className="mojshare-header">
        <button
          type="button"
          className="mojshare-title-btn"
          onClick={() => setShowMainMenu((prev) => !prev)}
        >
          <span>Moj Share</span>
          <MdKeyboardArrowDown
            className={
              showMainMenu
                ? "mojshare-title-chevron mojshare-title-chevron--open"
                : "mojshare-title-chevron"
            }
          />
        </button>

        {showMainMenu && (
          <div className="mojshare-main-menu">
            <button type="button">Kreiraj mapu</button>
            <button type="button">Prijenos datoteka</button>
            <button type="button">Prijenos mape</button>
          </div>
        )}
      </div>

      {/* Tablica */}
      <div className="mojshare-table-wrapper">
        <table className="mojshare-table">
          <thead>
            <tr>
              <th>Naziv</th>
              <th>Vlasnik</th>
              <th>Datum izmjene</th>
              <th>Veličina datoteke</th>
              <th className="mojshare-sort-col">
                <button
                  type="button"
                  className="mojshare-sort-btn"
                  onClick={() => setShowSortMenu((prev) => !prev)}
                >
                  Poredaj
                  <MdKeyboardArrowDown
                    className={
                      showSortMenu
                        ? "mojshare-sort-chevron mojshare-sort-chevron--open"
                        : "mojshare-sort-chevron"
                    }
                  />
                </button>

                {showSortMenu && (
                  <div className="mojshare-sort-menu">
                    <div className="mojshare-sort-section">
                      <span className="sort-section-label">Poredano po</span>
                      <button
                        className={
                          sortBy === "name"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setSortBy("name")}
                      >
                        Naziv
                      </button>
                      <button
                        className={
                          sortBy === "modified"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setSortBy("modified")}
                      >
                        Datum izmjene
                      </button>
                      <button
                        className={
                          sortBy === "myModified"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setSortBy("myModified")}
                      >
                        Datum moje izmjene
                      </button>
                      <button
                        className={
                          sortBy === "myOpened"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setSortBy("myOpened")}
                      >
                        Datum mojeg otvaranja
                      </button>
                    </div>

                    <div className="mojshare-sort-section">
                      <span className="sort-section-label">
                        Smjer razvrstavanja
                      </span>
                      <button
                        className={
                          sortDir === "asc"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setSortDir("asc")}
                      >
                        A do Ž
                      </button>
                      <button
                        className={
                          sortDir === "desc"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setSortDir("desc")}
                      >
                        Ž do A
                      </button>
                    </div>

                    <div className="mojshare-sort-section">
                      <span className="sort-section-label">Mape</span>
                      <button
                        className={
                          foldersPosition === "top"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setFoldersPosition("top")}
                      >
                        Na vrhu
                      </button>
                      <button
                        className={
                          foldersPosition === "mixed"
                            ? "sort-option sort-option--active"
                            : "sort-option"
                        }
                        onClick={() => setFoldersPosition("mixed")}
                      >
                        Kombinirano s datotekama
                      </button>
                    </div>
                  </div>
                )}
              </th>
            </tr>
          </thead>

          <tbody>
            {files.length === 0 ? (
              <tr>
                <td colSpan={5} className="mojshare-empty">
                  Nema datoteka u “Moj Share”.
                </td>
              </tr>
            ) : (
              /* kasnije: map preko datoteka */
              <tr>
                <td>Primjer.pdf</td>
                <td>Ti</td>
                <td>18.12.2025.</td>
                <td>1,2 MB</td>
                <td></td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default MojShare;
