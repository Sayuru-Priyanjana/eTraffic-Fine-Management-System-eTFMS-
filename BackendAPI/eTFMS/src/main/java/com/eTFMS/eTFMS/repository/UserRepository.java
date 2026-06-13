package com.eTFMS.eTFMS.repository;

import com.eTFMS.eTFMS.model.Role;
import com.eTFMS.eTFMS.model.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, String> {
    Optional<User> findByUsername(String username);
    List<User> findByRole(Role role);
}
