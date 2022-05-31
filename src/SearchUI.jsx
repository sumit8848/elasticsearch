import React, { useEffect, useState, useRef } from "react";
import ElasticsearchAPIConnector from "@elastic/search-ui-elasticsearch-connector";
import {
  ErrorBoundary,
  Facet,
  SearchProvider,
  WithSearch,
  SearchBox,
  Results,
  PagingInfo,
  ResultsPerPage,
  Paging,
  Sorting,
} from "@elastic/react-search-ui";

import "@elastic/react-search-ui-views/lib/styles/styles.css";
import SearchResultsViewer from "./SearchResultsViewer";
import {
  buildAutocompleteQueryConfig,
  buildFacetConfigFromConfig,
  buildSearchOptionsFromConfig,
  buildSortOptionsFromConfig,
  getConfig,
  getFacetFields,
} from "./config/config-helper";

import { Layout, SingleSelectFacet } from "@elastic/react-search-ui-views";

import buildRequest from "./buildRequest";
import runRequest from "./runRequest";
import applyDisjunctiveFaceting from "./applyDisjunctiveFaceting";
import buildState from "./buildState";

export default function SearchUI() {
  const [searchType, setSearchType] = useState("simple");
  const selectRef = useRef(searchType);
  const connector = new ElasticsearchAPIConnector({
    host: "https://bfa27fa749d341c8ad8cc092d323a3c5.us-central1.gcp.cloud.es.io:9243/",
    apiKey: "MUQxci00QUJsWTJPb25PRmRwS186b29RZXdsVllSeU9laF9BQkQ1QXF4UQ==",
    index: "pdf_metadata_v1",
  });

  // const config = {
  //   searchQuery: {
  //     facets: buildFacetConfigFromConfig(),
  //     ...buildSearchOptionsFromConfig(),
  //   },
  //   autocompleteQuery: buildAutocompleteQueryConfig(),
  //   apiConnector: connector,
  //   alwaysSearchOnInitialLoad: true,
  // };

  const buildMatch = (searchTerm) => {
    const searchType = selectRef.current.value;
    if (searchType === "simple")
      return searchTerm
        ? {
            match: {
              title: searchTerm,
            },
          }
        : { match_all: {} };

    if (searchType === "and")
      return searchTerm
        ? {
            bool: {
              must: [
                { term: { title: searchTerm.split("+")[0].trim() } },
                { term: { title: searchTerm.split("+")[1].trim() } },
              ],
            },
          }
        : { match_all: {} };
    if (searchType === "or")
      return searchTerm
        ? {
            bool: {
              should: [
                { term: { title: searchTerm.split("+")[0].trim() } },
                { term: { title: searchTerm.split("+")[1].trim() } },
              ],
            },
          }
        : { match_all: {} };
  };

  const config = {
    debug: true,
    hasA11yNotifications: true,
    onResultClick: () => {
      /* Not implemented */
    },
    onAutocompleteResultClick: async ({ documentId, query, ...args }) => {
      // const match = buildMatch(query);
      const requestBody = {
        query: {
          match: {
            title: query,
          },
        },
        _source: ["title", "uuid", "body.p"],
      };

      const responseJson = await runRequest(requestBody);
      const newState = buildState(
        responseJson,
        // responseJsonWithDisjunctiveFacetCounts,
        20
      );
      newState.results = newState.results?.map((result) => ({
        ...result,
        id: result.uuid,
      }));
      return { results: newState };
    },
    onAutocomplete: async ({ searchTerm }) => {
      // const requestBody = buildRequest({ searchTerm });

      // const match = buildMatch(searchTerm);
      const requestBody = {
        query: {
          match: {
            title: searchTerm,
          },
        },
        _source: ["title", "uuid"],
      };

      const json = await runRequest(requestBody);
      const state = buildState(json);
      const results = state.results?.map((result) => ({
        ...result,
        id: result.uuid,
      }));
      return {
        autocompletedResults: results,
      };
    },
    onSearch: async (state) => {
      const { resultsPerPage, searchTerm } = state;
      const match = buildMatch(searchTerm);
      const requestBody = {
        query: match,
        _source: ["title", "body.p", "uuid"],
      };
      // Note that this could be optimized by running all of these requests
      // at the same time. Kept simple here for clarity.
      const responseJson = await runRequest(requestBody);

      // const responseJsonWithDisjunctiveFacetCounts =
      //   await applyDisjunctiveFaceting(responseJson, state, ["title"]);
      const newState = buildState(
        responseJson,
        // responseJsonWithDisjunctiveFacetCounts,
        resultsPerPage
      );
      newState.results = newState.results?.map((result) => ({
        ...result,
        id: result.uuid,
      }));
      return newState;
    },
    apiConnector: connector,
    alwaysSearchOnInitialLoad: true,
  };
  return (
    <SearchProvider config={config}>
      <WithSearch
        mapContextToProps={({ wasSearched, results }) => ({
          wasSearched,
          results,
        })}
      >
        {({ wasSearched, results }) => {
          return (
            <div className="App">
              <ErrorBoundary>
                <Layout
                  header={
                    <>
                      <SearchBox
                        autocompleteSuggestions={true}
                        autocompleteMinimumCharacters={3}
                        autocompleteResults={{
                          linkTarget: "_blank",
                          sectionTitle: "Results",
                          titleField: "title",
                          urlField: "url",
                          shouldTrackClickThrough: true,
                        }}
                        debounceLength={300}
                      />
                      <select
                        ref={selectRef}
                        value={searchType}
                        onChange={(e) => {
                          setSearchType(e.target.value);
                        }}
                        data-toggle="tooltip"
                        data-placement="top"
                        title="Use '+' to seperate titles, ex: 'title1 + title2'"
                      >
                        <option value="simple">Simple search</option>
                        <option value="and">And search</option>
                        <option value="or">Or search</option>
                      </select>
                    </>
                  }
                  sideContent={
                    <div>
                      {wasSearched && (
                        <Sorting
                          label={"Sort by"}
                          sortOptions={buildSortOptionsFromConfig()}
                        />
                      )}
                      {getFacetFields().map((field) => (
                        <Facet key={field} field={field} label={field} />
                      ))}
                    </div>
                  }
                  bodyContent={
                    <Results
                      titleField="title"
                      urlField="url"
                      shouldTrackClickThrough={true}
                    />
                    //   results.map((result) => (
                    //     <SearchResultsViewer
                    //       result={result}
                    //       // searchTerm={searchTerm}
                    //       key={result.id.raw}
                    //     />
                    //   ))
                  }
                  bodyHeader={
                    <React.Fragment>
                      {wasSearched && <PagingInfo />}
                      {wasSearched && <ResultsPerPage />}
                    </React.Fragment>
                  }
                  bodyFooter={<Paging />}
                />
              </ErrorBoundary>
            </div>
          );
        }}
      </WithSearch>
    </SearchProvider>
  );
}
