package com.elo.api.repository;
import java.util.Optional;
import org.springframework.data.mongodb.repository.MongoRepository;
import com.elo.api.model.User;

public interface UserRepository extends MongoRepository<User, String> {
    Optional<User> findByUsername(String username);
    boolean existsByUsername(String username);
}
