package com.shifting.mapper;

import com.shifting.model.User;
import com.shifting.payload.dto.UserDto;

public class UserMapper {

    public static UserDto toDto(User user){
        UserDto userDto=new UserDto();
        userDto.setId(user.getId());
        userDto.setEmail(user.getEmail());
        userDto.setName(user.getName());
        userDto.setPhone(user.getPhone());
        return userDto;
    }
    public static User toEntity(UserDto userDto){
        User user=new User();
        user.setId(userDto.getId());
        user.setEmail(userDto.getEmail());
        user.setName(userDto.getName());
        user.setPhone(userDto.getPhone());
        user.setPassword(userDto.getPassword());
        return user;
    }
}