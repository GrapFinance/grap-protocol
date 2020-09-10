import React from "react";
import styled from "styled-components";
import {NavLink} from "react-router-dom";

const Nav: React.FC = () => {
  return (
    <StyledNav>
      <StyledLink exact activeClassName="active" to="/">
        Home
      </StyledLink>
      <StyledLink exact activeClassName="active" to="/farms">
        Farms
      </StyledLink>
      <StyledLink exact activeClassName="active" to="/wines">
        Wines
      </StyledLink>
      <StyledLink exact activeClassName="active" to="/mine">
        Mine
      </StyledLink>
      <StyledLink exact activeClassName="active" to="/stats">
        Stats
      </StyledLink>
    </StyledNav>
  );
};

const StyledNav = styled.nav`
  align-items: center;
  display: flex;
`;

const StyledLink = styled(NavLink)`
  color: ${(props) => props.theme.color.grey[400]};
  font-weight: 700;
  padding-left: ${(props) => props.theme.spacing[3]}px;
  padding-right: ${(props) => props.theme.spacing[3]}px;
  text-decoration: none;
  &:hover {
    color: ${(props) => props.theme.color.grey[500]};
  }
  &.active {
    color: ${(props) => props.theme.color.primary.main};
  }

  @media (max-width: 768px) {
    padding-left: ${(props) => props.theme.spacing[1]}px;
    padding-right: ${(props) => props.theme.spacing[1]}px;
  }
`;

export default Nav;
