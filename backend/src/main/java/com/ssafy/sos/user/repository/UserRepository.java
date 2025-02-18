package com.ssafy.sos.user.repository;

import com.ssafy.sos.user.domain.UserEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;
import org.springframework.transaction.annotation.Transactional;

import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<UserEntity, Long> {
    Optional<UserEntity> findById(Long id);
    UserEntity findByUsername(String username);
    UserEntity findByEmail(String email);

    @Modifying
    @Transactional
    @Query("UPDATE UserEntity u SET u.username = :newUsername WHERE u.id = :id")
    void updateUsernameById(Long id, String newUsername);

    @Modifying
    @Transactional
    @Query("UPDATE UserEntity u SET u.gold = u.gold + 200 WHERE u.id = :id")
    void addGoldById(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE UserEntity u SET u.gold = u.gold + 1000 WHERE u.id = :id")
    void addGoldByIdForEvent(Long id);

    @Modifying
    @Transactional
    @Query("UPDATE UserEntity u SET u.gold = u.gold + 200 WHERE u.username = :username")
    void addGoldByUsername(String username);

    @Modifying
    @Transactional
    @Query("UPDATE UserEntity u SET u.gold = u.gold - 150 WHERE u.id = :id")
    void subGoldById(Long id);

}