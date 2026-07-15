import React from "react";
import { MdKeyboardArrowDown } from "react-icons/md";

const FileTableHeader = ({
  sortBy,
  setSortBy,
  sortDir,
  setSortDir,
  foldersPosition,
  setFoldersPosition,
  showSortMenu,
  setShowSortMenu,
  columns = ["Naziv", "Vlasnik", "Datum izmjene", "Veličina"],
  sortOptions = ["name", "modified"],
}) => (
  <tr>
    <th>{columns[0]}</th>
    <th>{columns[1]}</th>
    <th>{columns[2]}</th>
    <th>{columns[3]}</th>
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
            {sortOptions.map((option) => (
              <button
                key={option}
                className={
                  sortBy === option
                    ? "sort-option sort-option--active"
                    : "sort-option"
                }
                onClick={() => {
                  setSortBy(option);
                  setShowSortMenu(false);
                }}
              >
                {option === "name" ? "Naziv" : "Datum izmjene"}
              </button>
            ))}
          </div>

          <div className="mojshare-sort-section">
            <span className="sort-section-label">Smjer razvrstavanja</span>
            <button
              className={
                sortDir === "asc"
                  ? "sort-option sort-option--active"
                  : "sort-option"
              }
              onClick={() => {
                setSortDir("asc");
                setShowSortMenu(false);
              }}
            >
              A do Ž
            </button>
            <button
              className={
                sortDir === "desc"
                  ? "sort-option sort-option--active"
                  : "sort-option"
              }
              onClick={() => {
                setSortDir("desc");
                setShowSortMenu(false);
              }}
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
              onClick={() => {
                setFoldersPosition("top");
                setShowSortMenu(false);
              }}
            >
              Na vrhu
            </button>
            <button
              className={
                foldersPosition === "mixed"
                  ? "sort-option sort-option--active"
                  : "sort-option"
              }
              onClick={() => {
                setFoldersPosition("mixed");
                setShowSortMenu(false);
              }}
            >
              Kombinirano s datotekama
            </button>
          </div>
        </div>
      )}
    </th>
  </tr>
);

export default FileTableHeader;
